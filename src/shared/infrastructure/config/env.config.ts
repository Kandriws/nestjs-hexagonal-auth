import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as joi from 'joi';

// Determinar qué archivo .env cargar basado en NODE_ENV
const envFilePath = path.resolve(
  process.cwd(),
  `.env.${process.env.NODE_ENV || 'development'}`,
);

// Verificar si existe el archivo específico del entorno
if (fs.existsSync(envFilePath)) {
  console.log(`Using environment config: ${envFilePath}`);
  dotenv.config({ path: envFilePath });
} else {
  // Fallback a .env estándar
  const defaultEnvPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(defaultEnvPath)) {
    console.log('Using default .env file');
    dotenv.config({ path: defaultEnvPath });
  } else {
    console.log('Using environment variables (no .env file found)');
    dotenv.config();
  }
}

// Si se está ejecutando en Docker, forzar el uso de .env
if (process.env.DOCKER_ENV === 'true') {
  const dockerEnvPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(dockerEnvPath)) {
    console.log('Using .env file for Docker');
    dotenv.config({ path: dockerEnvPath });
  }
}

// Estructura para variables por categoría
interface EnvConfig {
  app: {
    env: string;
    host: string;
    port: number;
    isProduction: boolean;
    isDevelopment: boolean;
    isTest: boolean;
  };
  database: {
    url: string;
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
    schema?: string;
    ssl?: boolean;
    logQueries: boolean;
  };
  jwt: {
    secret: string;
    expiration: string;
    refreshSecret: string;
    refreshExpiration: string;
    resetSecret: string;
  };
  google: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };
  otp: {
    expirationMinutes: number;
  };
  mail: {
    host: string;
    port: number;
    user: string;
    password: string;
    enabled: boolean;
    resetPasswordUrl: string;
    fromEmail?: string;
    fromName?: string;
  };
  cors: {
    origins: string[];
  };
  logging: {
    level: string;
    requests: boolean;
  };
}

// Esquema de validación
const envVarsSchema = joi
  .object({
    // App
    NODE_ENV: joi
      .string()
      .valid('development', 'production', 'test')
      .required(),
    HOST: joi.string().default('localhost'),
    PORT: joi.number().default(3000),

    // Database - Postgresql
    DATABASE_URL: joi.string().description('Full PostgreSQL connection URL'),
    DB_HOST: joi.string().required(),
    DB_PORT: joi.number().default(5432),
    DB_USERNAME: joi.string().required(),
    DB_PASSWORD: joi.string().required(),
    DB_NAME: joi.string().required(),
    DB_SCHEMA: joi.string().default('public'),
    DB_SSL: joi.boolean().default(false),
    DB_LOG_QUERIES: joi.boolean().default(false),

    // JWT
    JWT_SECRET: joi.string().required(),
    JWT_EXPIRATION: joi.string().default('1h'),
    REFRESH_JWT_SECRET: joi.string().required(),
    REFRESH_JWT_EXPIRATION: joi.string().default('7d'),
    JWT_RESET_SECRET: joi.string().required(),

    // Google Auth
    GOOGLE_CLIENT_ID: joi.string().required(),
    GOOGLE_CLIENT_SECRET: joi.string().required(),
    GOOGLE_CALLBACK_URL: joi.string().required(),

    // OTP
    OTP_EXPIRATION_MINUTES: joi.number().default(10).min(1).max(60).required(),

    // SMTP
    SMTP_HOST: joi.string().required(),
    SMTP_PORT: joi.number().default(587).required(),
    SMTP_USER: joi.string().required(),
    SMTP_PASS: joi.string().required(),
    SMTP_STATUS: joi.string().valid('true', 'false').default('false'),
    RESET_PASSWORD_URL: joi.string().required(),
    MAIL_FROM_EMAIL: joi.string().default('no-reply@example.com'),
    MAIL_FROM_NAME: joi.string().default('No Reply'),

    // CORS
    CORS_ORIGINS: joi.string().default('http://localhost:3000'),

    // Logging
    LOG_LEVEL: joi
      .string()
      .valid('debug', 'info', 'warn', 'error')
      .default('info'),
    LOG_REQUESTS: joi.boolean().default(true),
  })
  .unknown(true);

// Validación
const { error, value } = envVarsSchema.validate({
  ...process.env,
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Generar la DATABASE_URL si no está definida
if (!value.DATABASE_URL) {
  const ssl = value.DB_SSL ? '?sslmode=require' : '';
  value.DATABASE_URL = `postgresql://${value.DB_USERNAME}:${value.DB_PASSWORD}@${value.DB_HOST}:${value.DB_PORT}/${value.DB_NAME}${ssl}`;
}

// Configuración exportada
export const envs: EnvConfig = {
  app: {
    env: value.NODE_ENV,
    host: value.HOST,
    port: value.PORT,
    isProduction: value.NODE_ENV === 'production',
    isDevelopment: value.NODE_ENV === 'development',
    isTest: value.NODE_ENV === 'test',
  },
  database: {
    url: value.DATABASE_URL,
    host: value.DB_HOST,
    port: value.DB_PORT,
    username: value.DB_USERNAME,
    password: value.DB_PASSWORD,
    name: value.DB_NAME,
    schema: value.DB_SCHEMA,
    ssl: value.DB_SSL,
    logQueries: value.DB_LOG_QUERIES,
  },
  jwt: {
    secret: value.JWT_SECRET,
    expiration: value.JWT_EXPIRATION,
    refreshSecret: value.REFRESH_JWT_SECRET,
    refreshExpiration: value.REFRESH_JWT_EXPIRATION,
    resetSecret: value.JWT_RESET_SECRET,
  },
  google: {
    clientId: value.GOOGLE_CLIENT_ID,
    clientSecret: value.GOOGLE_CLIENT_SECRET,
    callbackUrl: value.GOOGLE_CALLBACK_URL,
  },
  otp: {
    expirationMinutes: value.OTP_EXPIRATION_MINUTES,
  },
  mail: {
    host: value.SMTP_HOST,
    port: value.SMTP_PORT,
    user: value.SMTP_USER,
    password: value.SMTP_PASS,
    enabled: value.SMTP_STATUS === 'true',
    resetPasswordUrl: value.RESET_PASSWORD_URL,
    fromEmail: value.MAIL_FROM_EMAIL,
    fromName: value.MAIL_FROM_NAME,
  },
  cors: {
    origins: value.CORS_ORIGINS
      ? value.CORS_ORIGINS.split(',')
      : ['http://localhost:3000'],
  },
  logging: {
    level: value.LOG_LEVEL,
    requests: value.LOG_REQUESTS,
  },
};
