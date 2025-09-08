import { Inject, Injectable } from '@nestjs/common';
import { AssignUserPermissionsCommand } from 'src/auth/domain/ports/inbound/commands/assign-user-permissions.command';
import { AssignUserPermissionsPort } from 'src/auth/domain/ports/inbound/assign-user-permissions.port';
import { UserRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/user.repository.port';
import { PermissionRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/permission.repository.port';
import {
  UserNotFoundException,
  PermissionNotFoundException,
} from 'src/auth/domain/exceptions';

@Injectable()
export class AssignPermissionsToUserUseCase
  implements AssignUserPermissionsPort
{
  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
    @Inject(PermissionRepositoryPort)
    private readonly permissionRepository: PermissionRepositoryPort,
  ) {}

  async execute(command: AssignUserPermissionsCommand): Promise<void> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) throw new UserNotFoundException();

    for (const permissionId of command.permissionIds) {
      const permission = await this.permissionRepository.findById(permissionId);
      if (!permission) throw new PermissionNotFoundException();
    }

    await this.userRepository.assignPermissions(
      command.userId,
      command.permissionIds,
      command.assignedById ?? null,
    );
  }
}
