import { registerAs } from '@nestjs/config';
import { envs } from './env.config';

export default registerAs('security', () => ({
  saltRounds: envs.security.saltRounds,
  otp: {
    email: {
      ttl: envs.security.otp.email.ttl,
    },
    sms: {
      ttl: envs.security.otp.sms.ttl,
    },
  },
}));
