import { Inject, Injectable } from '@nestjs/common';
import { DeleteRolePort } from 'src/auth/domain/ports/inbound';
import { RoleRepositoryPort } from 'src/auth/domain/ports/outbound/persistence';

@Injectable()
export class DeleteRoleUseCase implements DeleteRolePort {
  constructor(
    @Inject(RoleRepositoryPort)
    private readonly roleRepository: RoleRepositoryPort,
  ) {}

  async execute(roleId: string): Promise<void> {
    await this.roleRepository.delete(roleId);
  }
}
