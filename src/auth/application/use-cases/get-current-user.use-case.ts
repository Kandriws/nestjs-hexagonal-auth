import { Inject, Injectable } from '@nestjs/common';
import { GetCurrentUserPort } from 'src/auth/domain/ports/inbound/get-current-user.port';
import {
  UserRepositoryPort,
  RoleRepositoryPort,
  PermissionRepositoryPort,
} from 'src/auth/domain/ports/outbound/persistence';
import { User } from 'src/auth/domain/entities/user.entity';
import { UserId } from 'src/shared/domain/types';
import { UserNotFoundException } from 'src/auth/domain/exceptions';

@Injectable()
export class GetCurrentUserUseCase implements GetCurrentUserPort {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepositoryPort: UserRepositoryPort,
    @Inject(RoleRepositoryPort)
    private readonly roleRepositoryPort: RoleRepositoryPort,
    @Inject(PermissionRepositoryPort)
    private readonly permissionRepositoryPort: PermissionRepositoryPort,
  ) {}

  async execute(
    userId: UserId,
  ): Promise<{ user: User; roles: any[]; permissions: any[] }> {
    const user = await this.userRepositoryPort.findById(userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    const roles = await this.roleRepositoryPort.findByUserId(userId);
    const permissions =
      await this.permissionRepositoryPort.findByUserId(userId);

    return { user, roles, permissions };
  }
}
