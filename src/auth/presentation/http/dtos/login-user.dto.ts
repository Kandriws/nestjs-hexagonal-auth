import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

const strongPasswordOptions = {
  minLength: 8,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
};

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsStrongPassword(strongPasswordOptions)
  password: string;

  @IsOptional()
  @IsString()
  otpCode: string;
}
