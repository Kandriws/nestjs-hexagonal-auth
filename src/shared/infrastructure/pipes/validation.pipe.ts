import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';

const validationOptions: ValidationPipeOptions = {
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
  transformOptions: {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
  },
  validateCustomDecorators: false,
};

export const CustomValidationPipe = new ValidationPipe(validationOptions);
