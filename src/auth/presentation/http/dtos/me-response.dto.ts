import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';
import { RoleResponseDto } from './role-response.dto';
import { PermissionResponseDto } from './permission-response.dto';

export class MeResponseDto {
  @ApiProperty()
  user: UserResponseDto;

  @ApiProperty({ isArray: true })
  roles: RoleResponseDto[];

  @ApiProperty({ isArray: true })
  permissions: PermissionResponseDto[];
}
