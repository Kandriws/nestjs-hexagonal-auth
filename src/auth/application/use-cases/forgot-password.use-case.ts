import { Inject, Injectable, Logger } from '@nestjs/common';
import { Token } from 'src/auth/domain/entities';
import { AuthEventType, TokenType } from 'src/auth/domain/enums';
import {
  ForgotPasswordCommand,
  ForgotPasswordPort,
} from 'src/auth/domain/ports/inbound';
import { EventPublisherPort } from 'src/auth/domain/ports/outbound/messaging';
import {
  TokenRepositoryPort,
  TransactionManagerPort,
  UserRepositoryPort,
} from 'src/auth/domain/ports/outbound/persistence';
import {
  TokenProviderPort,
  UUIDPort,
} from 'src/auth/domain/ports/outbound/security';
import { ResetPasswordNotifierPort } from 'src/auth/domain/ports/outbound/notification/reset-password-notifier.port';
import { PublishablePasswordResetRequestedEvent } from 'src/auth/domain/types';
import { MailerEmailVo } from 'src/shared/domain/value-objects';

@Injectable()
export class ForgotPasswordUseCase implements ForgotPasswordPort {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);

  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
    @Inject(TokenProviderPort)
    private readonly tokenProvider: TokenProviderPort,
    @Inject(TokenRepositoryPort)
    private readonly tokenRepository: TokenRepositoryPort,
    @Inject(UUIDPort)
    private readonly uuidPort: UUIDPort,
    @Inject(ResetPasswordNotifierPort)
    private readonly resetNotifier: ResetPasswordNotifierPort,
    @Inject(TransactionManagerPort)
    private readonly txManager: TransactionManagerPort,
    @Inject(EventPublisherPort)
    private readonly eventPublisher: EventPublisherPort,
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

    const event: PublishablePasswordResetRequestedEvent = {
      eventId: this.uuidPort.generate(),
      eventType: AuthEventType.PASSWORD_RESET_REQUESTED,
      eventVersion: 'v1',
      occurredAt: new Date().toISOString(),
      producer: 'auth-service',
      aggregateId: user.id,
      payload: {
        userId: user.id,
        email: user.email.getValue(),
        resetToken,
        expiresAt: decodedRefreshToken.getExpiresAt().toISOString(),
        ipAddress,
        userAgent,
      },
    };

    await this.txManager.runInTransaction(async () => {
      await this.tokenRepository.save(token);
      await this.eventPublisher.publish(event);
    });

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
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to user ${user.id}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
