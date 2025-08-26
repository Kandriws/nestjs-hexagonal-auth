import { Inject } from '@nestjs/common';
import { Token } from 'src/auth/domain/entities';
import { TokenType } from 'src/auth/domain/enums';
import {
  ForgotPasswordCommand,
  ForgotPasswordPort,
} from 'src/auth/domain/ports/inbound';
import {
  TokenRepositoryPort,
  UserRepositoryPort,
} from 'src/auth/domain/ports/outbound/persistence';
import {
  TokenProviderPort,
  UUIDPort,
} from 'src/auth/domain/ports/outbound/security';
import { ResetPasswordNotifierPort } from 'src/auth/domain/ports/outbound/notification/reset-password-notifier.port';
import { MailerEmailVo } from 'src/shared/domain/value-objects';

export class ForgotPasswordUseCase implements ForgotPasswordPort {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
    @Inject(TokenProviderPort)
    private tokenProvider: TokenProviderPort,
    @Inject(TokenRepositoryPort)
    private tokenRepository: TokenRepositoryPort,
    @Inject(UUIDPort)
    private uuidPort: UUIDPort,
    @Inject(ResetPasswordNotifierPort)
    private readonly resetNotifier: ResetPasswordNotifierPort,
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<void> {
    const { email, ipAddress, userAgent } = command;
    const user = await this.userRepository.findByEmail(email.getValue());
    if (!user) return;
    const jti = this.uuidPort.generate();
    const tokenType = TokenType.RESET_PASSWORD;
    const resetToken = await this.tokenProvider.generate(
      user.id,
      user.email,
      tokenType,
      { jti },
    );

    const decodedRefreshToken = await this.tokenProvider.decode(resetToken);

    const token = Token.create({
      id: jti,
      userId: user.id,
      type: tokenType,
      expiresAt: decodedRefreshToken.getExpiresAt(),
      metadata: {
        ipAddress,
        userAgent,
      },
    });

    await this.tokenRepository.save(token);

    try {
      const userFullName = [
        user.firstName?.getValue?.(),
        user.lastName?.getValue?.(),
      ]
        .filter(Boolean)
        .join(' ');

      await this.resetNotifier.sendReset({
        to: MailerEmailVo.of(user.email.getValue(), userFullName),
        token: resetToken,
        expiresAt: decodedRefreshToken.getExpiresAt(),
        metadata: {
          ipAddress,
          userAgent,
        },
        name: userFullName || undefined,
      });
    } catch {}
  }
}
