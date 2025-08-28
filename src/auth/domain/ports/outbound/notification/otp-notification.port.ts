import { OtpChannel } from 'src/auth/domain/enums';
import { OtpNotificationContext } from './otp-notification-context';

export const OtpNotificationPort = Symbol('OtpNotificationPort');
export interface OtpNotificationPort {
  send(
    channel: OtpChannel,
    to: string[],
    context: OtpNotificationContext,
  ): Promise<void>;
}
