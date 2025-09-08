import { Inject, Injectable } from '@nestjs/common';
import { AssignUserRolesCommand } from 'src/auth/domain/ports/inbound/commands/assign-user-roles.command';
import { AssignUserRolesPort } from 'src/auth/domain/ports/inbound/assign-user-roles.port';
import { UserRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/user.repository.port';
import { RoleRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/role.repository.port';
import {
  UserNotFoundException,
  RoleNotFoundException,
} from 'src/auth/domain/exceptions';
import { UserId } from 'src/shared/domain/types';

@Injectable()
export class AssignRolesToUserUseCase implements AssignUserRolesPort {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
    @Inject(RoleRepositoryPort)
    private readonly roleRepository: RoleRepositoryPort,
  ) {}

  async execute(command: AssignUserRolesCommand): Promise<void> {
    const user = await this.userRepository.findById(
      command.userId as unknown as UserId,
    );
    if (!user) throw new UserNotFoundException();

    for (const roleId of command.roleIds) {
      const role = await this.roleRepository.findById(roleId);
      if (!role) throw new RoleNotFoundException();
    }

    await this.userRepository.assignRoles(
      command.userId,
      command.roleIds,
      command.assignedById ?? null,
    );
  }
}
