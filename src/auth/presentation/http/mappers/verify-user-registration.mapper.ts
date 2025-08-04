import { EmailVo } from 'src/shared/domain/value-objects';
import { VerifyUserRegistrationDto } from '../dtos/verify-user-registration.dto';
import { VerifyUserRegistrationCommand } from 'src/auth/domain/ports/inbound';
import { OtpCodeVo } from 'src/auth/domain/value-objects/otp-code.vo';

export class VerifyUserRegistrationMapper {
  static toCommand(
    dto: VerifyUserRegistrationDto,
  ): VerifyUserRegistrationCommand {
    return {
      email: EmailVo.of(dto.email),
      otpCode: OtpCodeVo.of(dto.otpCode),
    };
  }
}
