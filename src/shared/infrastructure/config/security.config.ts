import { registerAs } from '@nestjs/config';
import { envs } from './env.config';

export default registerAs('security', () => ({
  saltRounds: envs.security.saltRounds,
}));
