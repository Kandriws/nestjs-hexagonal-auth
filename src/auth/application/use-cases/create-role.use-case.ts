import { Inject, Injectable } from '@nestjs/common';
import { Role } from 'src/auth/domain/entities/role.entity';
import {
  CreateRoleCommand,
  CreateRolePort,
} from 'src/auth/domain/ports/inbound';
import { RoleRepositoryPort } from 'src/auth/domain/ports/outbound/persistence';
import { UUIDPort } from 'src/auth/domain/ports/outbound/security';

@Injectable()
export class CreateRoleUseCase implements CreateRolePort {
  constructor(
    @Inject(UUIDPort)
    private readonly uuidPort: UUIDPort,
    @Inject(RoleRepositoryPort)
    private readonly roleRepository: RoleRepositoryPort,
  ) {}

  async execute(command: CreateRoleCommand): Promise<Role> {
    const role = Role.create({
      id: this.uuidPort.generate(),
      name: command.name,
      description: command.description,
      realm: command.realm,
    });

    await this.roleRepository.save(role);
    return role;
  }
}
