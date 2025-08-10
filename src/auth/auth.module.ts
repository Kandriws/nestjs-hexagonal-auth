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
  TokenProviderPort,
  UUIDPort,
} from './domain/ports/outbound/security';
import {
  PrismaOtpRepositoryAdapter,
  PrismaUserRepositoryAdapter,
} from './infrastructure/adapters/outbound/persistence';
import {
  BcryptHasherAdapter,
  CryptoUUIDAdapter,
  JwtProviderAdapter,
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
import jwtConfig from './infrastructure/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { JwtTokenConfigMapper } from './infrastructure/utils/jwt-token-config.util';
import { TokenType } from './domain/enums';
import { jwtModuleFactory } from './infrastructure/config/jwt-module.factory';

@Module({
  controllers: [AuthController],
  providers: [
    JwtTokenConfigMapper,
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
      provide: TokenProviderPort,
      useClass: JwtProviderAdapter,
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
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      useFactory: (cfg) => jwtModuleFactory(TokenType.ACCESS, cfg),
      inject: [jwtConfig.KEY],
    }),
    ConfigModule.forFeature(securityConfig),
    ConfigModule.forFeature(jwtConfig),
  ],
})
export class AuthModule {}
