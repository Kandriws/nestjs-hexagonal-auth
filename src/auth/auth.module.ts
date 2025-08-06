import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './presentation/http/controllers/auth.controller';
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
import {
  OtpPolicyPort,
  OtpRateLimitPort,
} from './domain/ports/outbound/policy';
import { SharedModule } from 'src/shared/shared.module';
import { OtpNotificationPort } from './domain/ports/outbound/notification';
import { OtpNotificationSenderAdapter } from './infrastructure/adapters/outbound/notification';
import {
  RegisterUserPort,
  ResendRegistrationOtpPort,
  VerifyUserRegistrationPort,
} from './domain/ports/inbound';

import {
  OtpPolicyAdapter,
  PrismaOtpRateLimitAdapter,
} from './infrastructure/adapters/outbound/policy';
import {
  RegisterUserUseCase,
  ResendRegistrationOtpUseCase,
  VerifyUserRegistrationUseCase,
} from './application/use-cases';

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: RegisterUserPort,
      useClass: RegisterUserUseCase,
    },
    {
      provide: VerifyUserRegistrationPort,
      useClass: VerifyUserRegistrationUseCase,
    },
    {
      provide: ResendRegistrationOtpPort,
      useClass: ResendRegistrationOtpUseCase,
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
    {
      provide: OtpRateLimitPort,
      useClass: PrismaOtpRateLimitAdapter,
    },
    {
      provide: OtpNotificationPort,
      useClass: OtpNotificationSenderAdapter,
    },
  ],
  imports: [
    PrismaModule,
    SharedModule,
    ConfigModule.forFeature(securityConfig),
  ],
})
export class AuthModule {}
