import { Inject, Injectable } from '@nestjs/common';
import { Role } from 'src/auth/domain/entities/role.entity';
import { RoleRepositoryPort } from 'src/auth/domain/ports/outbound/persistence';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { RoleMapper } from './mappers/prisma-role.mapper';
import {
  PersistenceInfrastructureException,
  RoleAlreadyExistsException,
  RoleNotFoundException,
} from 'src/auth/domain/exceptions';
import { UserId } from 'src/shared/domain/types';

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
    } catch (error: any) {
      if (error && error.code === 'P2025') {
        throw new RoleNotFoundException();
      }

      throw new PersistenceInfrastructureException('Error deleting role');
    }
  }

  async assignPermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<void> {
    try {
      await this.prismaService.rolePermission.deleteMany({ where: { roleId } });

      if (!permissionIds || permissionIds.length === 0) return;

      const data = permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
        assignedAt: new Date(),
      }));

      await this.prismaService.rolePermission.createMany({
        data,
        skipDuplicates: true,
      });
    } catch {
      throw new PersistenceInfrastructureException(
        'Error assigning permissions to role',
      );
    }
  }

  async findByUserId(userId: UserId): Promise<Role[]> {
    const raws = await this.prismaService.userRole.findMany({
      where: { userId },
      include: { role: true },
    });

    return raws.map((userRole) => RoleMapper.toDomain(userRole.role));
  }
}
