import {
  RegisterUserPort,
  ResendRegistrationOtpPort,
  VerifyUserRegistrationPort,
  LoginUserPort,
  RefreshTokenPort,
} from './domain/ports/inbound';
import {
  OtpRepositoryPort,
  TokenRepositoryPort,
  UserRepositoryPort,
} from './domain/ports/outbound/persistence';
import {
  HasherPort,
  OtpGeneratorPort,
  OtpSenderPort,
  TokenProviderPort,
  UUIDPort,
} from './domain/ports/outbound/security';
import {
  LoginRateLimitPort,
  OtpPolicyPort,
  OtpRateLimitPort,
} from './domain/ports/outbound/policy';
import { OtpNotificationPort } from './domain/ports/outbound/notification';

import {
  PrismaOtpRepositoryAdapter,
  PrismaUserRepositoryAdapter,
  PrismaTokenRepositoryAdapter,
} from './infrastructure/adapters/outbound/persistence';
import {
  BcryptHasherAdapter,
  CryptoUUIDAdapter,
  JwtProviderAdapter,
  OtpGeneratorAdapter,
  OtpSenderAdapter,
} from './infrastructure/adapters/outbound/security';
import {
  OtpPolicyAdapter,
  PrismaLoginRateLimitAdapter,
  PrismaOtpRateLimitAdapter,
} from './infrastructure/adapters/outbound/policy';
import { OtpNotificationSenderAdapter } from './infrastructure/adapters/outbound/notification';

import {
  LoginUserUseCase,
  RefreshTokenUseCase,
  RegisterUserUseCase,
  ResendRegistrationOtpUseCase,
  VerifyUserRegistrationUseCase,
} from './application/use-cases';

export const useCaseProviders = [
  {
    provide: RegisterUserPort,
    useClass: RegisterUserUseCase,
  },
  {
    provide: LoginUserPort,
    useClass: LoginUserUseCase,
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
    provide: RefreshTokenPort,
    useClass: RefreshTokenUseCase,
  },
];

export const persistenceProviders = [
  {
    provide: UserRepositoryPort,
    useClass: PrismaUserRepositoryAdapter,
  },
  {
    provide: OtpRepositoryPort,
    useClass: PrismaOtpRepositoryAdapter,
  },
  {
    provide: TokenRepositoryPort,
    useClass: PrismaTokenRepositoryAdapter,
  },
];

export const securityProviders = [
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
    provide: OtpSenderPort,
    useClass: OtpSenderAdapter,
  },
];

export const policyProviders = [
  {
    provide: OtpPolicyPort,
    useClass: OtpPolicyAdapter,
  },
  {
    provide: OtpRateLimitPort,
    useClass: PrismaOtpRateLimitAdapter,
  },
  {
    provide: LoginRateLimitPort,
    useClass: PrismaLoginRateLimitAdapter,
  },
];

export const notificationProviders = [
  {
    provide: OtpNotificationPort,
    useClass: OtpNotificationSenderAdapter,
  },
];

export const allAuthProviders = [
  ...useCaseProviders,
  ...persistenceProviders,
  ...securityProviders,
  ...policyProviders,
  ...notificationProviders,
];
