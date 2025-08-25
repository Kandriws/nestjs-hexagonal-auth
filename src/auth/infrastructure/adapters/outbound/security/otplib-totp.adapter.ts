import { Inject, Injectable } from '@nestjs/common';
import { TOTPPort } from 'src/auth/domain/ports/outbound/security';
import { authenticator } from 'otplib';
import appConfig from 'src/shared/infrastructure/config/app.config';
@Injectable()
export class OtplibTotpAdapter implements TOTPPort {
  constructor(
    @Inject(appConfig.KEY)
    private readonly app: ReturnType<typeof appConfig>,
  ) {}

  async generateSecret(): Promise<string> {
    return authenticator.generateSecret();
  }

  async generateUri(secret: string, account: string): Promise<string> {
    return authenticator.keyuri(account, this.app.name, secret);
  }

  async verify(secret: string, token: string): Promise<boolean> {
    return authenticator.check(token, secret);
  }
}
