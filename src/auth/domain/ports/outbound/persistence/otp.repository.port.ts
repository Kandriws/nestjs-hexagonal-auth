import { Otp } from 'src/auth/domain/entities';
import { OtpCodeVo } from 'src/auth/domain/value-objects/otp-code.vo';
import { UserId } from 'src/shared/domain/types';

export const OtpRepositoryPort = Symbol('OtpRepositoryPort');

export interface OtpRepositoryPort {
  save(otp: Otp): Promise<void>;
  findByUserIdAndCode(userId: UserId, code: OtpCodeVo): Promise<Otp | null>;
  delete(otp: Otp): Promise<void>;
}
