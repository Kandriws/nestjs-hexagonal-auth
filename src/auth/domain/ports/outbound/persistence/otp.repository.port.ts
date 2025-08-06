import { Otp } from 'src/auth/domain/entities';
import { OtpCode } from 'src/auth/domain/types';
import { UserId } from 'src/shared/domain/types';

export const OtpRepositoryPort = Symbol('OtpRepositoryPort');

export interface OtpRepositoryPort {
  save(otp: Otp): Promise<void>;
  findByUserIdAndCode(userId: UserId, otpCode: OtpCode): Promise<Otp | null>;
  delete(otp: Otp): Promise<void>;
}
