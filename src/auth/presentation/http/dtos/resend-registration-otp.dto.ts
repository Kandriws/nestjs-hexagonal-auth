import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendRegistrationOtpDto {
  @IsEmail()
  @ApiProperty({ example: 'user@example.com' })
  email: string;
}
