import { IsEnum } from 'class-validator';
import { PostStatus } from '@prisma/client';

export class UpdatePostStatusDto {
  @IsEnum(PostStatus)
  status: PostStatus;
}
