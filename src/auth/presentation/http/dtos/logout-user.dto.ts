import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LogoutUserDto {
  @ApiProperty({ description: 'Refresh token to invalidate' })
  @IsString()
  refreshToken: string;
}
