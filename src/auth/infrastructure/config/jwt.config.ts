import { registerAs } from '@nestjs/config';
import { envs } from 'src/shared/infrastructure/config/env.config';

export default registerAs('jwt', () => ({
  access: {
    secret: envs.security.jwt.access.secret,
    expiresIn: envs.security.jwt.access.expiresIn,
  },
  refresh: {
    secret: envs.security.jwt.refresh.secret,
    expiresIn: envs.security.jwt.refresh.expiresIn,
  },
  reset: {
    secret: envs.security.jwt.reset.secret,
    expiresIn: envs.security.jwt.reset.expiresIn,
  },
}));
