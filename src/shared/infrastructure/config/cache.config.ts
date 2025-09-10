import { registerAs } from '@nestjs/config';
import { envs } from './env.config';

export default registerAs('redis', () => ({
  host: envs.cache.redis.host,
  port: envs.cache.redis.port,
  password: envs.cache.redis.password,
  url: envs.cache.redis.url,
  ttlDefaultSeconds: envs.cache.redis.ttlDefaultSeconds,
}));
