import { OtpChannel } from 'src/auth/domain/enums';
import { OtpNotificationContext } from './otp-notification-context';
import { MailerEmailVo } from 'src/shared/domain/value-objects';

export const OtpNotificationPort = Symbol('OtpNotificationPort');
export interface OtpNotificationPort {
  send(
    channel: OtpChannel,
    to: MailerEmailVo[],
    context: OtpNotificationContext,
  ): Promise<void>;
}
