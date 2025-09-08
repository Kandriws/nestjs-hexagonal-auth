import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/auth/domain/entities/user.entity';
import { FindUsersPort } from 'src/auth/domain/ports/inbound/find-users.port';
import { UserRepositoryPort } from 'src/auth/domain/ports/outbound/persistence';

@Injectable()
export class FindUsersUseCase implements FindUsersPort {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
