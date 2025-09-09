import { registerAs } from '@nestjs/config';
import { envs } from 'src/shared/infrastructure/config/env.config';

export default registerAs('googleOAuth', () => ({
  clientId: envs.oauth.google.clientId,
  clientSecret: envs.oauth.google.clientSecret,
  callbackUrl: envs.oauth.google.callbackUrl,
}));
