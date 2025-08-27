import { IsString, IsStrongPassword } from 'class-validator';

const strongPasswordOptions = {
  minLength: 8,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
};
export class ResetPasswordDto {
  @IsString()
  token: string;
  @IsStrongPassword(strongPasswordOptions)
  newPassword: string;
  @IsStrongPassword(strongPasswordOptions)
  confirmPassword: string;
}
