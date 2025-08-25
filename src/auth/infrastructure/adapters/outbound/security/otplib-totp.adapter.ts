import { Injectable } from '@nestjs/common';
import { TOTPPort } from 'src/auth/domain/ports/outbound/security';
import { authenticator } from 'otplib';
@Injectable()
export class OtplibTotpAdapter implements TOTPPort {
  async generateSecret(): Promise<string> {
    return authenticator.generateSecret();
  }

  async generateUri(
    secret: string,
    account: string,
    issuer: string,
  ): Promise<string> {
    return authenticator.keyuri(account, issuer, secret);
  }

  async verify(secret: string, token: string): Promise<boolean> {
    return authenticator.check(token, secret);
  }
}
