import {
  IsEmail,
  IsNotEmpty,
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

export class RegisterUserDto {
  @IsEmail()
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @IsStrongPassword(strongPasswordOptions)
  @ApiProperty({
    description:
      'Password policy: minimum 8 characters, at least 1 lowercase, 1 uppercase, 1 number and 1 symbol',
    minLength: 8,
    format: 'password',
    example: 'P@ssw0rd1',
  })
  password: string;

  @IsStrongPassword(strongPasswordOptions)
  @ApiProperty({
    description: 'Repeat password (must match password)',
    minLength: 8,
    format: 'password',
    example: 'P@ssw0rd1',
  })
  confirmPassword: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'John' })
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Doe' })
  lastName: string;
}
