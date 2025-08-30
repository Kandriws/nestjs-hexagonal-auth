import { Inject, Injectable } from '@nestjs/common';
import { FindRoleByIdPort } from 'src/auth/domain/ports/inbound/find-role-by-id.port';
import { RoleRepositoryPort } from 'src/auth/domain/ports/outbound/persistence';
import { RoleNotFoundException } from 'src/auth/domain/exceptions';

@Injectable()
export class FindRoleByIdUseCase implements FindRoleByIdPort {
  constructor(
    @Inject(RoleRepositoryPort)
    private readonly roleRepository: RoleRepositoryPort,
  ) {}

  async execute(id: string) {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new RoleNotFoundException();
    return role;
  }
}
