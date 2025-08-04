import { registerAs } from '@nestjs/config';
import { envs } from './env.config';

export default registerAs('mailer', () => ({
  host: envs.mail.host,
  port: envs.mail.port,
  secure: envs.mail.secure,
  auth: {
    user: envs.mail.auth.user,
    pass: envs.mail.auth.pass,
  },
  from: envs.mail.from,
}));
