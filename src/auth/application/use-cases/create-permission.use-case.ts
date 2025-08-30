import { Inject, Injectable } from '@nestjs/common';
import { Permission } from 'src/auth/domain/entities/permission.entity';
import {
  PermissionCommand,
  CreatePermissionPort,
} from 'src/auth/domain/ports/inbound';
import { PermissionRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/permission.repository.port';
import { UUIDPort } from 'src/auth/domain/ports/outbound/security';

@Injectable()
export class CreatePermissionUseCase implements CreatePermissionPort {
  constructor(
    @Inject(UUIDPort)
    private readonly uuidPort: UUIDPort,
    @Inject(PermissionRepositoryPort)
    private readonly permissionRepository: PermissionRepositoryPort,
  ) {}

  async execute(command: PermissionCommand): Promise<Permission> {
    const permission = Permission.create({
      id: this.uuidPort.generate(),
      name: command.name,
      realm: command.realm,
    });

    await this.permissionRepository.save(permission);
    return permission;
  }
}
