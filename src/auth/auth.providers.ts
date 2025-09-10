import {
  RegisterUserPort,
  ResendRegistrationOtpPort,
  VerifyUserRegistrationPort,
  LoginUserPort,
  RefreshTokenPort,
  EnableTwoFactorPort,
  VerifyTwoFactorPort,
  ForgotPasswordPort,
  ResetPasswordPort,
  OAuthLoginPort,
  LogoutUserPort,
} from './domain/ports/inbound';
import {
  OtpRepositoryPort,
  TokenRepositoryPort,
  TwoFactorSettingRepositoryPort,
} from './domain/ports/outbound/persistence';
import {
  EncryptionKeyStorePort,
  EncryptionPort,
  HasherPort,
  OtpGeneratorPort,
  OtpSenderPort,
  TokenProviderPort,
  TOTPPort,
  UUIDPort,
} from './domain/ports/outbound/security';
import {
  LoginRateLimitPort,
  OtpPolicyPort,
  OtpRateLimitPort,
} from './domain/ports/outbound/policy';
import {
  OtpNotificationPort,
  ResetPasswordNotifierPort,
} from './domain/ports/outbound/notification';

import {
  PrismaOtpRepositoryAdapter,
  PrismaTokenRepositoryAdapter,
  PrismaTwoFactorSettingRepositoryAdapter,
} from './infrastructure/adapters/outbound/persistence';
import {
  AesGcmEncryptionAdapter,
  BcryptHasherAdapter,
  CryptoUUIDAdapter,
  JwtTokenProviderAdapter,
  OtpGeneratorAdapter,
  OtplibTotpAdapter,
  OtpSenderAdapter,
} from './infrastructure/adapters/outbound/security';
import {
  OtpPolicyAdapter,
  PrismaLoginRateLimitAdapter,
  PrismaOtpRateLimitAdapter,
} from './infrastructure/adapters/outbound/policy';
import {
  OtpNotificationSenderAdapter,
  ResetPasswordNotifierAdapter,
} from './infrastructure/adapters/outbound/notification';

import {
  EnableTwoFactorUseCase,
  ForgotPasswordUseCase,
  LoginUserUseCase,
  RefreshTokenUseCase,
  RegisterUserUseCase,
  ResendRegistrationOtpUseCase,
  ResetPasswordUseCase,
  VerifyTwoFactorUseCase,
  VerifyUserRegistrationUseCase,
  LoginWithGoogleUseCase,
  LogoutUserUseCase,
} from './application/use-cases';
import { FileEncryptionKeyStoreAdapter } from './infrastructure/adapters/outbound/security/file-encryption-key-store.adapter';

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
  {
    provide: LogoutUserPort,
    useClass: LogoutUserUseCase,
  },
  {
    provide: EnableTwoFactorPort,
    useClass: EnableTwoFactorUseCase,
  },
  {
    provide: VerifyTwoFactorPort,
    useClass: VerifyTwoFactorUseCase,
  },
  {
    provide: ForgotPasswordPort,
    useClass: ForgotPasswordUseCase,
  },
  {
    provide: ResetPasswordPort,
    useClass: ResetPasswordUseCase,
  },
  {
    provide: OAuthLoginPort,
    useClass: LoginWithGoogleUseCase,
  },
];

export const persistenceProviders = [
  {
    provide: OtpRepositoryPort,
    useClass: PrismaOtpRepositoryAdapter,
  },
  {
    provide: TokenRepositoryPort,
    useClass: PrismaTokenRepositoryAdapter,
  },
  {
    provide: TwoFactorSettingRepositoryPort,
    useClass: PrismaTwoFactorSettingRepositoryAdapter,
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
    useClass: JwtTokenProviderAdapter,
  },
  {
    provide: OtpGeneratorPort,
    useClass: OtpGeneratorAdapter,
  },
  {
    provide: OtpSenderPort,
    useClass: OtpSenderAdapter,
  },
  {
    provide: TOTPPort,
    useClass: OtplibTotpAdapter,
  },
  {
    provide: EncryptionKeyStorePort,
    useClass: FileEncryptionKeyStoreAdapter,
  },
  {
    provide: EncryptionPort,
    useClass: AesGcmEncryptionAdapter,
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
  {
    provide: ResetPasswordNotifierPort,
    useClass: ResetPasswordNotifierAdapter,
  },
];

export const allAuthProviders = [
  ...useCaseProviders,
  ...persistenceProviders,
  ...securityProviders,
  ...policyProviders,
  ...notificationProviders,
];
