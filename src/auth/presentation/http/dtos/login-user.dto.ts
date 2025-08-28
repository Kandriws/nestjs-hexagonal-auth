import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const strongPasswordOptions = {
  minLength: 8,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
};

export class LoginUserDto {
  @IsEmail()
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @IsStrongPassword(strongPasswordOptions)
  @IsStrongPassword(strongPasswordOptions)
  @ApiProperty({
    description:
      'Password policy: minimum 8 characters, at least 1 lowercase, 1 uppercase, 1 number and 1 symbol',
    minLength: 8,
    format: 'password',
    example: 'P@ssw0rd1',
  })
  password: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Optional OTP code for 2FA', required: false })
  otpCode: string;
}
