import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './presentation/http/controllers/auth.controller';
import { RegisterUserPort } from './domain/ports/inbound/register-user.port';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { PrismaModule } from 'src/shared/infrastructure/prisma/prisma.module';
import {
  OtpRepositoryPort,
  UserRepositoryPort,
} from './domain/ports/outbound/persistence';
import {
  HasherPort,
  OtpGeneratorPort,
  UUIDPort,
} from './domain/ports/outbound/security';
import {
  PrismaOtpRepositoryAdapter,
  PrismaUserRepositoryAdapter,
} from './infrastructure/adapters/outbound/persistence';
import {
  BcryptHasherAdapter,
  CryptoUUIDAdapter,
  OtpGeneratorAdapter,
} from './infrastructure/adapters/outbound/security';
import securityConfig from 'src/shared/infrastructure/config/security.config';
import { OtpPolicyPort } from './domain/ports/outbound/policy';
import { OtpPolicyAdapter } from './infrastructure/adapters/outbound/policy/otp-policy.adapter';
import { SharedModule } from 'src/shared/shared.module';

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
      provide: OtpRepositoryPort,
      useClass: PrismaOtpRepositoryAdapter,
    },
    {
      provide: UUIDPort,
      useClass: CryptoUUIDAdapter,
    },
    {
      provide: HasherPort,
      useClass: BcryptHasherAdapter,
    },
    {
      provide: OtpGeneratorPort,
      useClass: OtpGeneratorAdapter,
    },
    {
      provide: OtpPolicyPort,
      useClass: OtpPolicyAdapter,
    },
  ],
  imports: [
    PrismaModule,
    SharedModule,
    ConfigModule.forFeature(securityConfig),
  ],
})
export class AuthModule {}
