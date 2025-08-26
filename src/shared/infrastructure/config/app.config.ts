import { registerAs } from '@nestjs/config';
import { envs } from './env.config';

export default registerAs('app', () => ({
  name: envs.app.name,
  host: envs.app.host,
  port: envs.app.port,
  isProduction: envs.app.isProduction,
  isDevelopment: envs.app.isDevelopment,
  isTest: envs.app.isTest,
  resetPasswordFrontendUrl: envs.app.resetPasswordFrontendUrl,
}));
