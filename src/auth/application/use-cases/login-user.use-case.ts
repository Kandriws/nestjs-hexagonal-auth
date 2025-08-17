import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/auth/domain/entities';
import { OtpChannel, OtpPurpose, TokenType } from 'src/auth/domain/enums';
import { AccessToken, RefreshToken } from 'src/shared/domain/types';
import { AuthTokensResponse } from 'src/auth/domain/ports/inbound/commands/auth-tokens-response';
import { LoginUserCommand } from 'src/auth/domain/ports/inbound/commands/login-user.command';
import { LoginUserPort } from 'src/auth/domain/ports/inbound/login-user.port';
import {
  TokenRepositoryPort,
  UserRepositoryPort,
} from 'src/auth/domain/ports/outbound/persistence';
import {
  HasherPort,
  OtpSenderPort,
  TokenProviderPort,
  UUIDPort,
} from 'src/auth/domain/ports/outbound/security';
import {
  InvalidCredentialsException,
  UserNotVerifiedException,
} from 'src/auth/domain/exceptions';
import { LoginRateLimitPort } from 'src/auth/domain/ports/outbound/policy';
import { RateLimitInfo } from 'src/auth/domain/types';

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
    @Inject(UUIDPort)
    private uuid: UUIDPort,
    @Inject(OtpSenderPort)
    private otpSender: OtpSenderPort,
    @Inject(LoginRateLimitPort)
    private loginRateLimit: LoginRateLimitPort,
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

    const tokenId = this.uuid.generate();

    const accessToken = await this.tokenProvider.generate(
      user.id,
      user.email,
      TokenType.ACCESS,
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
