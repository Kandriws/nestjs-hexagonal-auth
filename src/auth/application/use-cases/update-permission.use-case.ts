import { Inject, Injectable } from '@nestjs/common';
import { Permission } from 'src/auth/domain/entities/permission.entity';
import {
  UpdatePermissionCommand,
  UpdatePermissionPort,
} from 'src/auth/domain/ports/inbound';
import { PermissionRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/permission.repository.port';
import { PermissionNotFoundException } from 'src/auth/domain/exceptions';

@Injectable()
export class UpdatePermissionUseCase implements UpdatePermissionPort {
  constructor(
    @Inject(PermissionRepositoryPort)
    private readonly permissionRepository: PermissionRepositoryPort,
  ) {}

  async execute(command: UpdatePermissionCommand): Promise<Permission> {
    const permission = await this.permissionRepository.findById(
      command.permissionId,
    );
    if (!permission) throw new PermissionNotFoundException();

    permission.update(command);
    await this.permissionRepository.save(permission);
    return permission;
  }
}
