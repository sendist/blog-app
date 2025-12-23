import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateUserRoleDto {
  @IsNotEmpty()
  @IsEnum(['ADMIN', 'USER'], { message: 'Role must be either ADMIN or USER' })
  role: 'ADMIN' | 'USER';
}