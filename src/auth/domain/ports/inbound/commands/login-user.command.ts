import { OtpCodeVo } from 'src/auth/domain/value-objects';
import { EmailVo, PasswordVo } from 'src/shared/domain/value-objects';

export interface LoginUserCommand {
  email: EmailVo;
  password: PasswordVo;
  otpCode?: OtpCodeVo;
  ipAddress: string;
  userAgent: string;
}
