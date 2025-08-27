import { PasswordVo } from 'src/shared/domain/value-objects';

export interface ResetPasswordCommand {
  token: string;
  newPassword: PasswordVo;
}
