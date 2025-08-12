import { EmailVo, PasswordVo } from 'src/shared/domain/value-objects';

export interface LoginUserCommand {
  email: EmailVo;
  password: PasswordVo;
  ipAddress: string;
  userAgent: string;
}
