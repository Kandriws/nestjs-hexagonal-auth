import { VerifyTwoFactorCommand } from 'src/auth/domain/ports/inbound';
import { VerifyTwoFactorDto } from '../dtos';
import { UserId } from 'src/shared/domain/types';

export class VerifyTwoFactorMapper {
  static toCommand(dto: VerifyTwoFactorDto): VerifyTwoFactorCommand {
    return {
      userId: dto.userId as UserId,
      method: dto.method,
      otpCode: dto.otpCode,
    };
  }
}
