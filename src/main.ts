import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomValidationPipe } from './shared/infrastructure/pipes/validation.pipe';
import { GlobalExceptionsFilter } from './shared/infrastructure/exceptions/global-exceptions.filter';
import { setupSwagger } from './shared/infrastructure/config/swagger.config';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(CustomValidationPipe);
  app.useGlobalFilters(new GlobalExceptionsFilter());
  app.enableCors();
  app.use(morgan('dev'));
  app.setGlobalPrefix('api');

  setupSwagger(app);

  await app.listen(3000);
}
bootstrap();
