import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @IsString()
  @ApiProperty({ description: 'Refresh token obtained at login' })
  refreshToken: string;
}
