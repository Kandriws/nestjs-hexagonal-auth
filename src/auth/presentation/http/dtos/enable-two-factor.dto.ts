import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TwoFactorMethod } from 'src/auth/domain/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EnableTwoFactorDto {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'User id (filled automatically when authenticated)',
  })
  userId: string;
  @IsEnum(TwoFactorMethod)
  @ApiProperty({ enum: TwoFactorMethod })
  method: TwoFactorMethod;
}
