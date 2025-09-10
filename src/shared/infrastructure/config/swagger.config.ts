import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription(
      'Authentication API for user management and secure auth flows (JWT access & refresh tokens, 2FA, OAuth).',
    )
    .setVersion('1.0')
    .setContact(
      'Kewin Caviedes',
      'https://github.com/Kandriws',
      'kewincav0@gmail.com',
    )
    .setLicense('UNLICENSED', 'https://choosealicense.com/no-permission/')
    .addTag(
      'Auth',
      'Authentication endpoints (register, login, refresh, logout)',
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'jwt',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
    },
  });
}
