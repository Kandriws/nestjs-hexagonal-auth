import { Inject, Injectable } from '@nestjs/common';
import { FindPermissionByIdPort } from 'src/auth/domain/ports/inbound';
import { PermissionRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/permission.repository.port';
import { PermissionNotFoundException } from 'src/auth/domain/exceptions';

@Injectable()
export class FindPermissionByIdUseCase implements FindPermissionByIdPort {
  constructor(
    @Inject(PermissionRepositoryPort)
    private readonly permissionRepository: PermissionRepositoryPort,
  ) {}

  async execute(id: string) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) throw new PermissionNotFoundException();
    return permission;
  }
}
