import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'The role name' })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'The role description' })
  description?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'The realm to which the role belongs',
  })
  realm?: string;
}
