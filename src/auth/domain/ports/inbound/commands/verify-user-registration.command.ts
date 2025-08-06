import { OtpCodeVo } from 'src/auth/domain/value-objects/otp-code.vo';
import { EmailVo } from 'src/shared/domain/value-objects';

export interface VerifyUserRegistrationCommand {
  otpCode: OtpCodeVo;
  email: EmailVo;
}
