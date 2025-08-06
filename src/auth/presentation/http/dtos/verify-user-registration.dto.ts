import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyUserRegistrationDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  otpCode: string;
}
