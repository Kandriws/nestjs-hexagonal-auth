import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

export class AssignRolePermissionsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  @ApiProperty({ type: [String], description: 'Array of permission ids' })
  permissionIds: string[];
}
