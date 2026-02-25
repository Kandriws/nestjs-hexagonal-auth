import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { envs } from './env.config';

const allowedOrigins = envs.cors.origins.map((origin) => origin.trim());
const allowAllOrigins = allowedOrigins.includes('*');

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowAllOrigins || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  credentials: true,
  maxAge: 3600,
};
