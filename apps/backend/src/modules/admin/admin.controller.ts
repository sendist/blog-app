import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { AdminListPostsQuery } from './dto/admin-list-posts.query';
import { UpdatePostStatusDto } from './dto/update-post-status.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('api/admin')
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('users')
  listUsers() {
    return this.admin.listUsers();
  }

  @Patch('users/:id/role')
  async updateUserRole(
    @CurrentUser() admin: any, 
    @Param('id') id: string, 
    @Body() dto: UpdateUserRoleDto
  ) {
    return this.admin.updateUserRole(admin.id, id, dto);
  }

  @Delete('users/:id')
  async deleteUser(@CurrentUser() admin: any, @Param('id') id: string) {
    return this.admin.deleteUser(admin.id, id);
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
