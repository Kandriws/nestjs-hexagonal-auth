import { OtpChannel, OtpPurpose } from 'src/auth/domain/enums';
import { UserId } from 'src/shared/domain/types';
export const OtpRateLimitPort = Symbol('OtpRateLimitPort');
export interface OtpRateLimitPort {
  hit(userId: UserId, purpose: OtpPurpose, channel: OtpChannel): Promise<void>;
}
