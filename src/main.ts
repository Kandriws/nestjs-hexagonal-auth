import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomValidationPipe } from './shared/infrastructure/pipes/validation.pipe';
import { GlobalExceptionsFilter } from './shared/infrastructure/exceptions/global-exceptions.filter';
import { setupSwagger } from './shared/infrastructure/config/swagger.config';
import * as morgan from 'morgan';
import helmet from 'helmet';
import { envs } from './shared/infrastructure/config/env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.useGlobalPipes(CustomValidationPipe);
  app.useGlobalFilters(new GlobalExceptionsFilter());
  app.enableCors({
    origin: ['*'],
    methods: 'GET,POST,PUT,PATCH,DELETE',
    credentials: true,
  });
  app.use(envs.app.isDevelopment ? morgan('dev') : morgan('combined'));
  app.setGlobalPrefix('api');

  setupSwagger(app);

  await app.listen(3000);
}
bootstrap();
