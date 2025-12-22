import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ListPostsQuery } from './dto/list-posts.query';
import { PostStatus } from '@prisma/client';
import { slugify } from '../../common/utils/slugify';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  private async generateUniqueSlug(baseTitle: string): Promise<string> {
    const base = slugify(baseTitle);
    let slug = base;
    let counter = 2;

    // Keep checking until unique
    while (await this.prisma.post.findUnique({ where: { slug } })) {
      slug = `${base}-${counter++}`;
    }
    return slug;
  }

  async create(userId: string, dto: CreatePostDto) {
    const slug = await this.generateUniqueSlug(dto.title);

    const data: any = {
      userId,
      title: dto.title,
      slug,
      content: dto.content,
      status: dto.status ?? PostStatus.DRAFT,
    };

    return this.prisma.post.create({
      data,
      select: {
        id: true, title: true, slug: true, status: true, excerpt: true,
        createdAt: true, updatedAt: true,
      },
    });
  }

  async list(userId: string, q: ListPostsQuery) {
    const skip = (q.page - 1) * q.limit;

    const where: any = {
      userId,
    };

    if (q.status) where.status = q.status;

    if (q.q) {
      where.OR = [
        { title: { contains: q.q, mode: 'insensitive' } },
        { content: { contains: q.q, mode: 'insensitive' } },
        { excerpt: { contains: q.q, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.post.count({ where }),
      this.prisma.post.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: q.limit,
        select: {
          id: true, title: true, slug: true, status: true, content: true,
          createdAt: true, updatedAt: true,
        },
      }),
    ]);

    return {
      data,
      meta: { page: q.page, limit: q.limit, total },
    };
  }

  async getDetail(userId: string, idOrSlug: string) {
    const post = await this.prisma.post.findFirst({
      where: {
        AND: [
          { userId },
          {
            OR: [{ id: idOrSlug }, { slug: idOrSlug }],
          },
        ],
      },
      select: {
        id: true, userId: true, title: true, slug: true, content: true,
        excerpt: true, status: true,
        createdAt: true, updatedAt: true,
      },
    });

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async update(userId: string, idOrSlug: string, dto: UpdatePostDto) {
    // First find the post owned by user
    const existing = await this.prisma.post.findFirst({
      where: {
        AND: [
          { userId },
          { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
        ],
      },
    });

    if (!existing) throw new NotFoundException('Post not found');

    const data: any = {
      title: dto.title ?? undefined,
      content: dto.content ?? undefined,
      status: dto.status ?? undefined,
    };

    // If title changes, regenerate slug
    if (dto.title && dto.title !== existing.title) {
      data.slug = await this.generateUniqueSlug(dto.title);
    }

    return this.prisma.post.update({
      where: { id: existing.id },
      data,
      select: {
        id: true, title: true, slug: true, content: true, excerpt: true, status: true,
        createdAt: true, updatedAt: true,
      },
    });
  }

  async remove(userId: string, idOrSlug: string) {
    const existing = await this.prisma.post.findFirst({
      where: {
        AND: [
          { userId },
          { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
        ],
      },
    });

    if (!existing) throw new NotFoundException('Post not found');

    await this.prisma.post.delete({
      where: { id: existing.id },
    });

    return { ok: true };
  }

  async listPublic(q: ListPostsQuery) {
    const skip = (q.page - 1) * q.limit;

    const where: any = {
      status: PostStatus.PUBLISHED,
    };

    if (q.q) {
      where.OR = [
        { title: { contains: q.q, mode: 'insensitive' } },
        { content: { contains: q.q, mode: 'insensitive' } },
        { excerpt: { contains: q.q, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.post.count({ where }),
      this.prisma.post.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: q.limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { id: true, name: true } }, // show author
        },
      }),
    ]);

    return { data, meta: { page: q.page, limit: q.limit, total } };
  }

  async getPublicDetail(slug: string) {
    const post = await this.prisma.post.findFirst({
      where: {
        slug,
        status: PostStatus.PUBLISHED,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true } },
      },
    });

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }
}
