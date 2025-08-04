import { OtpPurpose } from 'src/auth/domain/enums';
import { OtpCodeVo } from 'src/auth/domain/value-objects/otp-code.vo';

export interface OtpNotificationContext {
  purpose: OtpPurpose;
  code: OtpCodeVo;
  ttl: number;
  locale?: string;
}
