import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomValidationPipe } from './shared/infrastructure/pipes/validation.pipe';
import { GlobalExceptionsFilter } from './shared/infrastructure/exceptions/global-exceptions.filter';
import { setupSwagger } from './shared/infrastructure/config/swagger.config';
import * as morgan from 'morgan';
import helmet from 'helmet';
import { envs } from './shared/infrastructure/config/env.config';
import { StructuredLogger } from './shared/infrastructure/logger/structured-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new StructuredLogger('Bootstrap'),
  });

  app.use(helmet());
  app.useGlobalPipes(CustomValidationPipe);
  app.useGlobalFilters(new GlobalExceptionsFilter());
  const allowedOrigins = envs.cors.origins;
  const isWildcard = allowedOrigins.length === 1 && allowedOrigins[0] === '*';

  app.enableCors({
    origin: isWildcard ? true : allowedOrigins,
    methods: 'GET,POST,PUT,PATCH,DELETE',
    credentials: !isWildcard,
  });
  // Morgan HTTP logging — include correlation ID in production
  (morgan as any).token(
    'correlation-id',
    (req: any) => req.correlationId ?? '-',
  );
  const morganFormat = envs.app.isDevelopment
    ? 'dev'
    : ':correlation-id :remote-addr :method :url :status :response-time ms';
  app.use((morgan as any)(morganFormat));
  app.setGlobalPrefix('api');

  setupSwagger(app);

  await app.listen(envs.app.port);
}
bootstrap();
