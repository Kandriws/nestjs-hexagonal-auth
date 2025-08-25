import { TwoFactorMethod } from 'src/auth/domain/enums';
import { UserId } from 'src/shared/domain/types';

export interface VerifyTwoFactorCommand {
  userId: UserId;
  method: TwoFactorMethod;
  code: string;
}
