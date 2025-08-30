import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @ApiProperty({ description: 'The permission name' })
  name: string;

  @IsString()
  @ApiProperty({ description: 'The realm to which the permission belongs' })
  realm: string;
}
