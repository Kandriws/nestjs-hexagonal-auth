import { Inject, Injectable } from '@nestjs/common';
import { Role } from 'src/auth/domain/entities/role.entity';
import { FindRolesPort } from 'src/auth/domain/ports/inbound/find-roles.port';
import { RoleRepositoryPort } from 'src/auth/domain/ports/outbound/persistence';

@Injectable()
export class FindRolesUseCase implements FindRolesPort {
  constructor(
    @Inject(RoleRepositoryPort)
    private readonly roleRepository: RoleRepositoryPort,
  ) {}

  async execute(): Promise<Role[]> {
    return this.roleRepository.findAll();
  }
}
