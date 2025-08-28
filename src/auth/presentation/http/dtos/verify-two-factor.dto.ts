import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TwoFactorMethod } from 'src/auth/domain/enums';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyTwoFactorDto {
  @IsUUID()
  @IsOptional()
  @ApiProperty({
    description: 'User id (filled automatically when authenticated)',
    required: false,
  })
  userId: string;
  @IsEnum(TwoFactorMethod)
  @ApiProperty({ enum: TwoFactorMethod })
  method: TwoFactorMethod;
  @IsString()
  @ApiProperty({ description: 'OTP code for verification' })
  otpCode: string;
}
