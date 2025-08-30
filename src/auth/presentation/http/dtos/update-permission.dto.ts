import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'The permission name' })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'The realm to which the permission belongs',
  })
  realm?: string;
}
