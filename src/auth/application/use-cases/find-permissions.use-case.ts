import { Inject, Injectable } from '@nestjs/common';
import { Permission } from 'src/auth/domain/entities/permission.entity';
import { FindPermissionsPort } from 'src/auth/domain/ports/inbound';
import { PermissionRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/permission.repository.port';

@Injectable()
export class FindPermissionsUseCase implements FindPermissionsPort {
  constructor(
    @Inject(PermissionRepositoryPort)
    private readonly permissionRepository: PermissionRepositoryPort,
  ) {}

  async execute(): Promise<Permission[]> {
    return this.permissionRepository.findAll();
  }
}
