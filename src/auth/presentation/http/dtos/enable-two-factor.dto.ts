import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TwoFactorMethod } from 'src/auth/domain/enums';

export class EnableTwoFactorDto {
  @IsOptional()
  @IsUUID()
  userId: string;
  @IsEnum(TwoFactorMethod)
  method: TwoFactorMethod;
}
