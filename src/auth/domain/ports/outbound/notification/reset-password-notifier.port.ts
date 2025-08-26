import { MailerEmailVo } from 'src/shared/domain/value-objects';

export const ResetPasswordNotifierPort = Symbol('ResetPasswordNotifierPort');

export interface ResetPasswordNotifierPort {
  sendReset(params: {
    to: MailerEmailVo;
    token: string;
    expiresAt?: Date;
    metadata?: Record<string, any>;
    name?: string;
  }): Promise<void>;
}
