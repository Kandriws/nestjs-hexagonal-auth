import { Inject, Injectable } from '@nestjs/common';
import { Role } from 'src/auth/domain/entities/role.entity';
import { RoleRepositoryPort } from 'src/auth/domain/ports/outbound/persistence';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { RoleMapper } from './mappers/prisma-role.mapper';
import {
  PersistenceInfrastructureException,
  RoleAlreadyExistsException,
} from 'src/auth/domain/exceptions';

@Injectable()
export class PrismaRoleRepositoryAdapter implements RoleRepositoryPort {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService,
  ) {}

  async findById(id: string): Promise<Role | null> {
    const role = await this.prismaService.role.findUnique({ where: { id } });
    return role ? RoleMapper.toDomain(role) : null;
  }

  async findAll(): Promise<Role[]> {
    const roles = await this.prismaService.role.findMany();
    return roles.map(RoleMapper.toDomain);
  }

  async save(role: Role): Promise<void> {
    try {
      const roleData = RoleMapper.toPersistence(role);

      await this.prismaService.role.upsert({
        where: { id: roleData.id },
        create: roleData,
        update: roleData,
      });
    } catch (error) {
      const code = (error as any)?.code;
      if (code === 'P2002') {
        throw new RoleAlreadyExistsException();
      }

      throw new PersistenceInfrastructureException('Error saving role');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prismaService.role.delete({ where: { id } });
    } catch {
      throw new PersistenceInfrastructureException('Error deleting role');
    }
  }
}
