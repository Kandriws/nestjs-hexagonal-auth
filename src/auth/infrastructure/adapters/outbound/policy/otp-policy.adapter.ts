import { Inject, Injectable } from '@nestjs/common';
import { OtpChannel } from 'src/auth/domain/enums';
import { UnknownOtpChannelException } from 'src/auth/domain/exceptions';
import { OtpPolicyPort } from 'src/auth/domain/ports/outbound/policy';

import securityConfig from 'src/shared/infrastructure/config/security.config';

@Injectable()
export class OtpPolicyAdapter implements OtpPolicyPort {
  constructor(
    @Inject(securityConfig.KEY)
    private readonly config: ReturnType<typeof securityConfig>,
  ) {}

  ttlMinutes(channel: OtpChannel): number {
    const key = channel.toLowerCase() as keyof typeof this.config.otp.channel;

    const ttl = this.config.otp.channel[key]?.ttl;

    if (!ttl) {
      throw new UnknownOtpChannelException(
        `Unknown OTP policy channel: ${channel}`,
      );
    }
    return ttl;
  }
}
