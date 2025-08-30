import { Inject, Injectable } from '@nestjs/common';
import { DeletePermissionPort } from 'src/auth/domain/ports/inbound';
import { PermissionRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/permission.repository.port';

@Injectable()
export class DeletePermissionUseCase implements DeletePermissionPort {
  constructor(
    @Inject(PermissionRepositoryPort)
    private readonly permissionRepository: PermissionRepositoryPort,
  ) {}

  async execute(permissionId: string): Promise<void> {
    await this.permissionRepository.delete(permissionId);
  }
}
