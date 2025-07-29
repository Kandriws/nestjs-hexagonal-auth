import { Injectable } from '@nestjs/common';
import { OtpGeneratorPort } from 'src/auth/domain/ports/outbound/security';

@Injectable()
export class OtpGeneratorAdapter implements OtpGeneratorPort {
  async generate(): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
  }
}
