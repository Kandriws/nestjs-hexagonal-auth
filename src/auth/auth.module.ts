import { Module } from '@nestjs/common';
import { AuthController } from './presentation/http/controllers/auth.controller';
import { RegisterUserPort } from './domain/ports/inbound/register-user.port';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { UserRepositoryPort } from './domain/ports/outbound/persistence/user.repository.port';
import { PrismaUserRepositoryAdapter } from './infrastructure/adapters/outbound/persistence/prisma-user.repository.adapter';
import { PrismaModule } from 'src/shared/infrastructure/prisma/prisma.module';
import { HasherPort, UUIDPort } from './domain/ports/outbound/security';
import {
  BcryptHasherAdapter,
  CryptoUUIDAdapter,
} from './infrastructure/adapters/outbound/security';
import { ConfigModule } from '@nestjs/config';
import securityConfig from 'src/shared/infrastructure/config/security.config';

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: RegisterUserPort,
      useClass: RegisterUserUseCase,
    },
    {
      provide: UserRepositoryPort,
      useClass: PrismaUserRepositoryAdapter,
    },
    {
      provide: UUIDPort,
      useClass: CryptoUUIDAdapter,
    },
    {
      provide: HasherPort,
      useClass: BcryptHasherAdapter,
    },
  ],
  imports: [PrismaModule, ConfigModule.forFeature(securityConfig)],
})
export class AuthModule {}
