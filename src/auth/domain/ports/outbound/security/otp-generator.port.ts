import { OtpCode } from 'src/auth/domain/types';

export const OtpGeneratorPort = Symbol('OtpGeneratorPort');
export interface OtpGeneratorPort {
  generate(): Promise<OtpCode>;
}
