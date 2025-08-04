import { UserId } from 'src/shared/domain/types';
import { OtpCodeVo } from '../value-objects/otp-code.vo';
import { OtpChannel, OtpPurpose } from '../enums';

export interface CreateOtpDto {
  id: string;
  userId: UserId;
  code: OtpCodeVo;
  channel: OtpChannel;
  purpose: OtpPurpose;
  expiresAt: Date;
}
