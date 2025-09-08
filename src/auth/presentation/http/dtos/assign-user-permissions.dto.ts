import { ApiProperty } from '@nestjs/swagger';

export class AssignUserPermissionsDto {
  @ApiProperty({ required: true, description: 'List of permission ids' })
  permissionIds: string[];
}
