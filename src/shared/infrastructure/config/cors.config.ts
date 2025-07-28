import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { envs } from './env.config';

export const corsConfig: CorsOptions = {
  origin: envs.cors.origins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  credentials: true,
  maxAge: 3600,
};
