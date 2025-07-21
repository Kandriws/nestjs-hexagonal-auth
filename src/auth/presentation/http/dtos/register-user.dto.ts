import {
  IsEmail,
  IsNotEmpty,
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

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsStrongPassword(strongPasswordOptions)
  password: string;

  @IsStrongPassword(strongPasswordOptions)
  confirmPassword: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;
}
