import { Injectable } from '@nestjs/common';
import { OtpGeneratorPort } from 'src/auth/domain/ports/outbound/security';
import { OtpCode } from 'src/auth/domain/types';

@Injectable()
export class OtpGeneratorAdapter implements OtpGeneratorPort {
  async generate(): Promise<OtpCode> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp as OtpCode;
  }
}
