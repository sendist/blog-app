import { Controller, Get, Param, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { ListPostsQuery } from './dto/list-posts.query';

@Controller('api/public/posts')
export class PublicPostsController {
  constructor(private posts: PostsService) {}

  @Get()
  list(@Query() query: ListPostsQuery) {
    return this.posts.listPublic(query);
  }

  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.posts.getPublicDetail(slug);
  }
}
