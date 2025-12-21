import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Max, Min } from 'class-validator';
import { PostStatus } from '@prisma/client';

export class ListPostsQuery {
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsString()
  q?: string;

  @Transform(({ value }) => Number(value ?? 1))
  @Min(1)
  page: number = 1;

  @Transform(({ value }) => Number(value ?? 10))
  @Min(1)
  @Max(50)
  limit: number = 10;
}
