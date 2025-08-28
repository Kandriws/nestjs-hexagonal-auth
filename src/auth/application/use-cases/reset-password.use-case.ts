import { Inject, Injectable } from '@nestjs/common';
import { TokenType } from 'src/auth/domain/enums';
import {
  TokenNotFoundException,
  TokenAlreadyConsumedException,
  UserNotFoundException,
} from 'src/auth/domain/exceptions';
import {
  ResetPasswordCommand,
  ResetPasswordPort,
} from 'src/auth/domain/ports/inbound';
import {
  TokenRepositoryPort,
  UserRepositoryPort,
} from 'src/auth/domain/ports/outbound/persistence';
import {
  HasherPort,
  TokenProviderPort,
} from 'src/auth/domain/ports/outbound/security';

@Injectable()
export class ResetPasswordUseCase implements ResetPasswordPort {
  constructor(
    @Inject(TokenProviderPort)
    private readonly tokenProvider: TokenProviderPort,
    @Inject(TokenRepositoryPort)
    private readonly tokenRepository: TokenRepositoryPort,
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
    @Inject(HasherPort)
    private readonly hasher: HasherPort,
  ) {}
  async execute(command: ResetPasswordCommand): Promise<void> {
    const { token, newPassword } = command;
    const tokenPayload = await this.tokenProvider.validate(
      token,
      TokenType.RESET_PASSWORD,
    );

    const tokenRecord = await this.tokenRepository.findByTokenId(
      tokenPayload.getJti(),
    );

    if (!tokenRecord) {
      throw new TokenNotFoundException();
    }

    if (tokenRecord.isConsumed && tokenRecord.isConsumed()) {
      throw new TokenAlreadyConsumedException();
    }

    const consumedNow = await this.tokenRepository.markConsumedIfNotConsumed(
      tokenPayload.getJti(),
    );

    if (!consumedNow) {
      throw new TokenAlreadyConsumedException();
    }

    const user = await this.userRepository.findById(tokenRecord.userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    if (!user.isVerified) {
      user.markAsVerified();
    }

    const hashedPassword = await this.hasher.hash(newPassword.getValue());

    user.updatePassword(hashedPassword);
    await this.userRepository.save(user);
  }
}
