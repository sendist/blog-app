import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { AdminListPostsQuery } from './dto/admin-list-posts.query';
import { UpdatePostStatusDto } from './dto/update-post-status.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('api/admin')
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('users')
  listUsers() {
    return this.admin.listUsers();
  }

  @Get('posts')
  listPosts(@Query() query: AdminListPostsQuery) {
    return this.admin.listPosts(query);
  }

  @Patch('posts/:id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdatePostStatusDto) {
    return this.admin.updatePostStatus(id, dto);
  }
}
