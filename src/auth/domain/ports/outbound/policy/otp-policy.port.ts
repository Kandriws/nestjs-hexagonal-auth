import { OtpChannel } from 'src/auth/domain/types';
export const OtpPolicyPort = Symbol('OtpPolicyPort');
export interface OtpPolicyPort {
  ttlMinutes(channel: OtpChannel): number;
}
