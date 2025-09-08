import { Inject, Injectable } from '@nestjs/common';
import { AssignRolePermissionsCommand } from 'src/auth/domain/ports/inbound/commands/assign-role-permissions.command';
import { AssignRolePermissionsPort } from 'src/auth/domain/ports/inbound/assign-role-permissions.port';
import { RoleRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/role.repository.port';
import { PermissionRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/permission.repository.port';
import {
  RoleNotFoundException,
  PermissionNotFoundException,
} from 'src/auth/domain/exceptions';

@Injectable()
export class AssignPermissionsToRoleUseCase
  implements AssignRolePermissionsPort
{
  constructor(
    @Inject(RoleRepositoryPort)
    private readonly roleRepository: RoleRepositoryPort,
    @Inject(PermissionRepositoryPort)
    private readonly permissionRepository: PermissionRepositoryPort,
  ) {}

  async execute(command: AssignRolePermissionsCommand): Promise<void> {
    const role = await this.roleRepository.findById(command.roleId);
    if (!role) throw new RoleNotFoundException();

    for (const permissionId of command.permissionIds) {
      const permission = await this.permissionRepository.findById(permissionId);
      if (!permission) throw new PermissionNotFoundException();
    }

    await this.roleRepository.assignPermissions(
      command.roleId,
      command.permissionIds,
    );
  }
}
