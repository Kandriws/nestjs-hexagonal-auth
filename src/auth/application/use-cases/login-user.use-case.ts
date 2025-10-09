import { Inject, Injectable } from '@nestjs/common';
import { Token, TwoFactorSetting } from 'src/auth/domain/entities';
import { OtpChannel, OtpPurpose, TokenType } from 'src/auth/domain/enums';
import { AccessToken, RefreshToken } from 'src/shared/domain/types';
import { AuthTokensResponse } from 'src/auth/domain/ports/inbound/commands/auth-tokens-response';
import { LoginUserCommand } from 'src/auth/domain/ports/inbound/commands/login-user.command';
import { LoginUserPort } from 'src/auth/domain/ports/inbound/login-user.port';
import {
  OtpRepositoryPort,
  TokenRepositoryPort,
  TwoFactorSettingRepositoryPort,
  UserRepositoryPort,
  RoleRepositoryPort,
  PermissionRepositoryPort,
} from 'src/auth/domain/ports/outbound/persistence';
import {
  EncryptionPort,
  HasherPort,
  OtpSenderPort,
  TokenProviderPort,
  TOTPPort,
  UUIDPort,
} from 'src/auth/domain/ports/outbound/security';
import {
  InvalidCredentialsException,
  InvalidTotpCodeException,
  OtpCodeRequiredException,
  OtpNotFoundException,
  UserNotVerifiedException,
} from 'src/auth/domain/exceptions';
import { LoginRateLimitPort } from 'src/auth/domain/ports/outbound/policy';
import { RateLimitInfo } from 'src/auth/domain/types';
import { Permission } from 'src/auth/domain/entities/permission.entity';
import { Role } from 'src/auth/domain/entities/role.entity';

@Injectable()
export class LoginUserUseCase implements LoginUserPort {
  constructor(
    @Inject(UserRepositoryPort)
    private userRepository: UserRepositoryPort,
    @Inject(HasherPort)
    private hasher: HasherPort,
    @Inject(TokenProviderPort)
    private tokenProvider: TokenProviderPort,
    @Inject(TokenRepositoryPort)
    private tokenRepository: TokenRepositoryPort,
    @Inject(RoleRepositoryPort)
    private roleRepository: RoleRepositoryPort,
    @Inject(PermissionRepositoryPort)
    private permissionRepository: PermissionRepositoryPort,
    @Inject(UUIDPort)
    private uuid: UUIDPort,
    @Inject(OtpSenderPort)
    private otpSender: OtpSenderPort,
    @Inject(LoginRateLimitPort)
    private loginRateLimit: LoginRateLimitPort,
    @Inject(TwoFactorSettingRepositoryPort)
    private twoFactorSettingRepository: TwoFactorSettingRepositoryPort,
    @Inject(TOTPPort)
    private totp: TOTPPort,
    @Inject(EncryptionPort)
    private encryption: EncryptionPort,
    @Inject(OtpRepositoryPort)
    private otpRepository: OtpRepositoryPort,
  ) {}

  async execute(command: LoginUserCommand): Promise<AuthTokensResponse> {
    const user = await this.userRepository.findByEmail(
      command.email.getValue(),
    );

    if (!user) {
      throw new InvalidCredentialsException();
    }

    if (!user.isVerified()) {
      const channel: OtpChannel = OtpChannel.EMAIL;
      const purpose: OtpPurpose = OtpPurpose.EMAIL_VERIFICATION;

      await this.otpSender.sendOtp({
        userId: user.id,
        contact: user.email.getValue(),
        channel,
        purpose,
      });

      throw new UserNotVerifiedException(
        `If your email is correct, we have sent you a verification code to ${user.email.getValue()}. Please verify your email to log in.`,
      );
    }

    const twoFactorSettingRecord =
      await this.twoFactorSettingRepository.findByUserId(user.id);
    if (
      twoFactorSettingRecord !== null &&
      twoFactorSettingRecord.isVerificationNeeded()
    ) {
      await this.handleTwoFactorAuthentication(
        user,
        command,
        twoFactorSettingRecord,
      );
    }

    const isValid = await this.hasher.compare(
      command.password.getValue(),
      user.password.getValue(),
    );

    if (!isValid) {
      const rateLimitInfo: RateLimitInfo = await this.loginRateLimit.hit(
        user.id,
      );

      throw new InvalidCredentialsException(
        `Invalid credentials. Attempts: ${rateLimitInfo.attempts}, remaining: ${rateLimitInfo.remainingAttempts}`,
      );
    }

    await this.loginRateLimit.reset(user.id);
    return this.createAndPersistTokens(user, command);
  }

  private async handleTwoFactorAuthentication(
    user: any,
    command: LoginUserCommand,
    twoFactorSettingRecord: TwoFactorSetting,
  ): Promise<void> {
    if (!command.otpCode) {
      if (twoFactorSettingRecord.isMethodNotifyable()) {
        const purpose: OtpPurpose = OtpPurpose.TWO_FACTOR_AUTHENTICATION;
        await this.otpSender.sendOtp({
          userId: user.id,
          contact: user.email.getValue(),
          channel: twoFactorSettingRecord.parseTwoFactorMethodToOtpChannel(),
          purpose,
        });

        throw new OtpCodeRequiredException(
          `Two-factor authentication is required. Please check your ${twoFactorSettingRecord.parseTwoFactorMethodToOtpChannel()} for the OTP code.`,
          [
            {
              method: twoFactorSettingRecord.method,
            },
          ],
        );
      }

      throw new OtpCodeRequiredException(
        `Two-factor authentication is required. Please check your authenticator app for the OTP code.`,
        [
          {
            method: twoFactorSettingRecord.method,
          },
        ],
      );
    }

    const isDecryptionRequired = !twoFactorSettingRecord.isMethodNotifyable();

    if (isDecryptionRequired) {
      const decryptedOtp = await this.encryption.decrypt(
        twoFactorSettingRecord.secretCiphertext,
        twoFactorSettingRecord.secretMetadata,
      );

      const isTotpValid = await this.totp.verify(
        decryptedOtp.plaintext,
        command.otpCode.getValue(),
      );

      if (!isTotpValid) {
        const rateLimitInfo: RateLimitInfo = await this.loginRateLimit.hit(
          user.id,
        );
        throw new InvalidTotpCodeException(
          `Invalid TOTP code. Attempts: ${rateLimitInfo.attempts}, remaining: ${rateLimitInfo.remainingAttempts}`,
        );
      }

      return;
    }

    const otpRecord = await this.otpRepository.findByUserIdAndCode(
      user.id,
      command.otpCode.getValue(),
    );

    if (!otpRecord) {
      const rateLimitInfo: RateLimitInfo = await this.loginRateLimit.hit(
        user.id,
      );
      throw new OtpNotFoundException(
        `Invalid OTP code. Attempts: ${rateLimitInfo.attempts}, remaining: ${rateLimitInfo.remainingAttempts}`,
      );
    }

    const callback = async (): Promise<string> => {
      const rateLimitInfo: RateLimitInfo = await this.loginRateLimit.hit(
        user.id,
      );
      return `Attempts: ${rateLimitInfo.attempts}, remaining: ${rateLimitInfo.remainingAttempts}`;
    };

    await otpRecord.markAsUsedFor(
      OtpPurpose.TWO_FACTOR_AUTHENTICATION,
      callback,
    );
    await this.otpRepository.save(otpRecord);
  }

  private async createAndPersistTokens(
    user: any,
    command: LoginUserCommand,
  ): Promise<AuthTokensResponse> {
    const tokenId = this.uuid.generate();
    const roles = await this.roleRepository.findByUserId(user.id);
    const permissions = await this.permissionRepository.findByUserId(user.id);

    const accessToken = await this.tokenProvider.generate(
      user.id,
      user.email,
      TokenType.ACCESS,
      {
        roles: roles.map((role: Role) => ({
          name: role.name,
          realm: role.realm,
        })),
        permissions: permissions.map((permission: Permission) => ({
          name: permission.name,
          realm: permission.realm,
        })),
      },
    );

    const refreshToken = await this.tokenProvider.generate(
      user.id,
      user.email,
      TokenType.REFRESH,
      { jti: tokenId },
    );

    const decodedRefreshToken = await this.tokenProvider.decode(refreshToken);

    const token = Token.create({
      id: tokenId,
      userId: user.id,
      type: TokenType.REFRESH,
      expiresAt: decodedRefreshToken.getExpiresAt(),
      metadata: {
        ipAddress: command.ipAddress,
        userAgent: command.userAgent,
      },
    });

    await this.tokenRepository.save(token);

    return {
      accessToken: accessToken as AccessToken,
      refreshToken: refreshToken as RefreshToken,
    } as AuthTokensResponse;
  }
}
