import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TwoFactorMethod } from 'src/auth/domain/enums';

export class VerifyTwoFactorDto {
  @IsUUID()
  @IsOptional()
  userId: string;
  @IsEnum(TwoFactorMethod)
  method: TwoFactorMethod;
  @IsString()
  code: string;
}
