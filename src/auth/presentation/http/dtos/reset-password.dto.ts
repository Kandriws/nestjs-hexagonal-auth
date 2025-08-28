import { IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const strongPasswordOptions = {
  minLength: 8,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
};
export class ResetPasswordDto {
  @IsString()
  @ApiProperty({ description: 'Password reset token sent via email' })
  token: string;
  @IsStrongPassword(strongPasswordOptions)
  @IsStrongPassword(strongPasswordOptions)
  @ApiProperty({
    description:
      'Password policy: minimum 8 characters, at least 1 lowercase, 1 uppercase, 1 number and 1 symbol',
    minLength: 8,
    format: 'password',
    example: 'N3wP@ssw0rd!',
  })
  newPassword: string;
  @IsStrongPassword(strongPasswordOptions)
  @ApiProperty({
    description: 'Repeat new password (must match newPassword)',
    minLength: 8,
    format: 'password',
    example: 'N3wP@ssw0rd!',
  })
  confirmPassword: string;
}
