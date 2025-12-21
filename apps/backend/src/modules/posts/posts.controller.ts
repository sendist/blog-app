import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ListPostsQuery } from './dto/list-posts.query';

@UseGuards(JwtAuthGuard)
@Controller('api/posts')
export class PostsController {
  constructor(private posts: PostsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreatePostDto) {
    return this.posts.create(user.id, dto);
  }

  @Get()
  list(@CurrentUser() user: any, @Query() query: ListPostsQuery) {
    return this.posts.list(user.id, query);
  }

  @Get(':idOrSlug')
  detail(@CurrentUser() user: any, @Param('idOrSlug') idOrSlug: string) {
    return this.posts.getDetail(user.id, idOrSlug);
  }

  @Patch(':idOrSlug')
  update(
    @CurrentUser() user: any,
    @Param('idOrSlug') idOrSlug: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.posts.update(user.id, idOrSlug, dto);
  }

  @Delete(':idOrSlug')
  remove(@CurrentUser() user: any, @Param('idOrSlug') idOrSlug: string) {
    return this.posts.remove(user.id, idOrSlug);
  }
}
