import { Inject, Injectable } from '@nestjs/common';
import { Role } from 'src/auth/domain/entities/role.entity';
import { RoleNotFoundException } from 'src/auth/domain/exceptions';

import {
  UpdateRoleCommand,
  UpdateRolePort,
} from 'src/auth/domain/ports/inbound';
import { RoleRepositoryPort } from 'src/auth/domain/ports/outbound/persistence';

@Injectable()
export class UpdateRoleUseCase implements UpdateRolePort {
  constructor(
    @Inject(RoleRepositoryPort)
    private readonly roleRepository: RoleRepositoryPort,
  ) {}

  async execute(command: UpdateRoleCommand): Promise<Role> {
    const role = await this.roleRepository.findById(command.roleId);
    if (!role) throw new RoleNotFoundException();

    role.update(command);
    await this.roleRepository.save(role);
    return role;
  }
}
