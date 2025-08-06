import { EmailVo } from 'src/shared/domain/value-objects';
import { ResendRegistrationOtpDto } from '../dtos/resend-registration-otp.dto';

export class ResendRegistrationOtpMapper {
  static toCommand(dto: ResendRegistrationOtpDto): { email: EmailVo } {
    return {
      email: EmailVo.of(dto.email),
    };
  }
}
