import { OtpChannel, OtpPurpose } from 'src/auth/domain/enums';
import { UserId } from 'src/shared/domain/types';

export interface SendOtpCommand {
  userId: UserId;
  contact: string;
  purpose: OtpPurpose;
  channel: OtpChannel;
}
