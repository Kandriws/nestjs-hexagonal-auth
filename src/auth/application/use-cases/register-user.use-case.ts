import { Inject } from '@nestjs/common';
import { User } from 'src/auth/domain/entities/user.entity';
import { UserAlreadyExistsException } from 'src/auth/domain/exceptions';
import { RegisterUserCommand } from 'src/auth/domain/ports/inbound/commands/register.command';
import { RegisterUserPort } from 'src/auth/domain/ports/inbound/register-user.port';
import { UserRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/user.repository.port';
import { HasherPort } from 'src/auth/domain/ports/outbound/security';
import { UUIDPort } from 'src/auth/domain/ports/outbound/security/uuid.port';
import { UserId } from 'src/shared/domain/types';

export class RegisterUserUseCase implements RegisterUserPort {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
    @Inject(UUIDPort)
    private readonly uuid: UUIDPort,
    @Inject(HasherPort)
    private readonly hasher: HasherPort,
  ) {}

  async execute(command: RegisterUserCommand): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(command.email);

    if (existingUser) {
      throw new UserAlreadyExistsException();
    }

    const user = User.create({
      id: this.uuid.generate() as UserId,
      email: command.email,
      password: await this.hasher.hash(command.password),
      firstName: command.firstName,
      lastName: command.lastName,
    });

    await this.userRepository.save(user);
  }
}
