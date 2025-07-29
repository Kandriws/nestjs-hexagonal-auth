import { UserId } from 'src/shared/domain/types';
import { OtpCodeVo } from '../value-objects/otp-code.vo';

export interface CreateOtpDto {
  id: string;
  userId: UserId;
  code: OtpCodeVo;
  expiresAt: Date;
}
