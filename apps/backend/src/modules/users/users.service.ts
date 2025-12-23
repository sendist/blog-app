import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    // prevent empty PATCH body
    if (!dto.name && dto.bio === undefined) {
      return this.getMe(userId);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        bio: dto.bio,
        imageUrl: dto.imageUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async uploadAvatar(userId: string, imageUrl: string) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { imageUrl },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return updated;
  }
}
