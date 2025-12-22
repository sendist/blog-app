import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PostStatus } from '@prisma/client';
import { AdminListPostsQuery } from './dto/admin-list-posts.query';
import { UpdatePostStatusDto } from './dto/update-post-status.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async listUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async listPosts(q: AdminListPostsQuery) {
    const skip = (q.page - 1) * q.limit;

    const where: any = {};

    if (q.status) where.status = q.status;

    if (q.q) {
      where.OR = [
        { title: { contains: q.q, mode: 'insensitive' } },
        { content: { contains: q.q, mode: 'insensitive' } },
        { user: { is: { name: { contains: q.q, mode: 'insensitive' } } } },
        { user: { is: { email: { contains: q.q, mode: 'insensitive' } } } },
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
          status: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return { data, meta: { page: q.page, limit: q.limit, total } };
  }

  async updatePostStatus(postId: string, dto: UpdatePostStatusDto) {
    const existing = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!existing) throw new NotFoundException('Post not found');

    const data: any = { status: dto.status };

    return this.prisma.post.update({
      where: { id: postId },
      data,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async deleteUser(adminId: string, targetUserId: string) {
    if (adminId === targetUserId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, role: true },
    });

    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.delete({
      where: { id: targetUserId },
    });

    return { ok: true };
  }
}
