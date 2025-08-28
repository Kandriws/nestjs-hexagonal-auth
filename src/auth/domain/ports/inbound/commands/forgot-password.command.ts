import { EmailVo } from 'src/shared/domain/value-objects';

export interface ForgotPasswordCommand {
  email: EmailVo;
  ipAddress: string;
  userAgent: string;
}
