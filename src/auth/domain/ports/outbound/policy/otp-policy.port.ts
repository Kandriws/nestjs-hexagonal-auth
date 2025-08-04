import { OtpChannel } from 'src/auth/domain/enums';

export const OtpPolicyPort = Symbol('OtpPolicyPort');
export interface OtpPolicyPort {
  ttlMinutes(channel: OtpChannel): number;
}
