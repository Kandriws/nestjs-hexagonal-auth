import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as joi from 'joi';

// Determine which .env file to load based on NODE_ENV
const envFilePath = path.resolve(
  process.cwd(),
  `.env.${process.env.NODE_ENV || 'development'}`,
);

// Check if the specific environment file exists
if (fs.existsSync(envFilePath)) {
  console.log(`Using environment config: ${envFilePath}`);
  dotenv.config({ path: envFilePath });
} else {
  // Fallback to standard .env
  const defaultEnvPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(defaultEnvPath)) {
    console.log('Using default .env file');
    dotenv.config({ path: defaultEnvPath });
  } else {
    console.log('Using environment variables (no .env file found)');
    dotenv.config();
  }
}

// If running in Docker, force the use of .env
if (process.env.DOCKER_ENV === 'true') {
  const dockerEnvPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(dockerEnvPath)) {
    console.log('Using .env file for Docker');
    dotenv.config({ path: dockerEnvPath });
  }
}

// Structure for variables by category
interface EnvConfig {
  app: {
    env: string;
    name: string;
    host: string;
    port: number;
    isProduction: boolean;
    isDevelopment: boolean;
    isTest: boolean;
  };
  mail: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
    from: string;
    fromName: string;
  };
  security: {
    rateLimitProfile: string;
    saltRounds: number;
    encryption: {
      keysFilePath: string;
    };
    otp: {
      channel: {
        email: {
          ttl: number;
        };
        sms: {
          ttl: number;
        };
      };
      rateLimit: {
        maxAttempts: number;
        windowMinutes: number;
      };
    };
    jwt: {
      access: {
        secret: string;
        expiresIn: string;
      };
      refresh: {
        secret: string;
        expiresIn: string;
      };
      reset: {
        secret: string;
        expiresIn: string;
      };
    };
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
  cors: {
    origins: string[];
  };
}

// Validation schema
const envVarsSchema = joi
  .object({
    // App
    NODE_ENV: joi
      .string()
      .valid('development', 'production', 'test')
      .required(),
    NAME: joi.string().default('AuthHexArchBackend'),
    HOST: joi.string().default('localhost'),
    PORT: joi.number().default(3000),

    // Mailer
    MAIL_HOST: joi.string().required(),
    MAIL_PORT: joi.number().default(587),
    MAIL_SECURE: joi.string().valid('true', 'false').default('false'),
    MAIL_USER: joi.string().required(),
    MAIL_PASS: joi.string().required(),
    MAIL_FROM_EMAIL: joi.string().email().required(),
    MAIL_FROM_NAME: joi.string().default('No Reply'),

    // Security
    RATE_LIMIT_PROFILE: joi
      .string()
      .valid('standard', 'aggressive')
      .default('standard')
      .description('Rate limit profile to use'),
    SALT_ROUNDS: joi.number().default(10).description('Bcrypt salt rounds'),
    OTP_TTL_EMAIL: joi
      .number()
      .default(10)
      .description('OTP TTL for email in minutes'),
    OTP_TTL_SMS: joi
      .number()
      .default(5)
      .description('OTP TTL for SMS in minutes'),

    OTP_RATE_LIMIT_MAX_ATTEMPTS: joi
      .number()
      .default(3)
      .description('Maximum OTP attempts before rate limiting'),
    OTP_RATE_LIMIT_WINDOW_MINUTES: joi
      .number()
      .default(15)
      .description('Time window for OTP rate limiting in minutes'),

    ENCRYPTION_KEYS_FILE_PATH: joi.string().required(),

    // JWT
    JWT_ACCESS_SECRET: joi.string().required(),
    JWT_ACCESS_EXPIRATION: joi.string().default('15m'),
    JWT_REFRESH_SECRET: joi.string().required(),
    JWT_REFRESH_EXPIRATION: joi.string().default('30d'),
    JWT_RESET_SECRET: joi.string().required(),
    JWT_RESET_EXPIRATION: joi.string().default('1h'),

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

    // CORS
    CORS_ORIGINS: joi
      .string()
      .default('*')
      .description('Comma-separated list of allowed CORS origins'),
  })
  .unknown(true);

// Validation
const { error, value } = envVarsSchema.validate({
  ...process.env,
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Generate DATABASE_URL if not defined
if (!value.DATABASE_URL) {
  const ssl = value.DB_SSL ? '?sslmode=require' : '';
  value.DATABASE_URL = `postgresql://${value.DB_USERNAME}:${value.DB_PASSWORD}@${value.DB_HOST}:${value.DB_PORT}/${value.DB_NAME}${ssl}`;
}

// Exported configuration
export const envs: EnvConfig = {
  app: {
    env: value.NODE_ENV,
    name: value.NAME,
    host: value.HOST,
    port: value.PORT,
    isProduction: value.NODE_ENV === 'production',
    isDevelopment: value.NODE_ENV === 'development',
    isTest: value.NODE_ENV === 'test',
  },
  mail: {
    host: value.MAIL_HOST,
    port: Number(value.MAIL_PORT),
    secure: value.MAIL_SECURE === 'true',
    auth: {
      user: value.MAIL_USER,
      pass: value.MAIL_PASS,
    },
    from: value.MAIL_FROM_EMAIL,
    fromName: value.MAIL_FROM_NAME,
  },
  security: {
    rateLimitProfile: value.RATE_LIMIT_PROFILE,
    saltRounds: value.SALT_ROUNDS,
    encryption: {
      keysFilePath: value.ENCRYPTION_KEYS_FILE_PATH,
    },
    otp: {
      channel: {
        email: {
          ttl: value.OTP_TTL_EMAIL,
        },
        sms: {
          ttl: value.OTP_TTL_SMS,
        },
      },
      rateLimit: {
        maxAttempts: value.OTP_RATE_LIMIT_MAX_ATTEMPTS,
        windowMinutes: value.OTP_RATE_LIMIT_WINDOW_MINUTES,
      },
    },
    jwt: {
      access: {
        secret: value.JWT_ACCESS_SECRET,
        expiresIn: value.JWT_ACCESS_EXPIRATION,
      },
      refresh: {
        secret: value.JWT_REFRESH_SECRET,
        expiresIn: value.JWT_REFRESH_EXPIRATION,
      },
      reset: {
        secret: value.JWT_RESET_SECRET,
        expiresIn: value.JWT_RESET_EXPIRATION,
      },
    },
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
  cors: {
    origins: value.CORS_ORIGINS ? value.CORS_ORIGINS.split(',') : ['*'],
  },
};
