import { registerAs } from '@nestjs/config';
import { envs } from './env.config';

export default registerAs('security', () => ({
  rateLimitProfile: envs.security.rateLimitProfile,
  saltRounds: envs.security.saltRounds,
  otp: {
    channel: {
      email: {
        ttl: envs.security.otp.channel.email.ttl,
      },
      sms: {
        ttl: envs.security.otp.channel.sms.ttl,
      },
    },
    rateLimit: {
      maxAttempts: envs.security.otp.rateLimit.maxAttempts,
      windowMinutes: envs.security.otp.rateLimit.windowMinutes,
    },
  },
}));
