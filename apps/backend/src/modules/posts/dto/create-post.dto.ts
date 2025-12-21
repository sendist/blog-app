import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { PostStatus } from '@prisma/client';

export class CreatePostDto {
    @IsString()
    @MinLength(3)
    title: string;

    @IsString()
    @MinLength(10)
    content: string;

    @IsOptional()
    @IsEnum(PostStatus)
    status?: PostStatus;
}