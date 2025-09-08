import { Inject, Injectable } from '@nestjs/common';
import { Permission } from 'src/auth/domain/entities/permission.entity';
import { PermissionRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/permission.repository.port';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { PrismaPermissionMapper } from './mappers/prisma-permission.mapper';
import { PersistenceInfrastructureException } from 'src/auth/domain/exceptions';
import { UserId } from 'src/shared/domain/types';

@Injectable()
export class PrismaPermissionRepositoryAdapter
  implements PermissionRepositoryPort
{
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService,
  ) {}

  async findById(id: string): Promise<Permission | null> {
    const raw = await this.prismaService.permission.findUnique({
      where: { id },
    });
    return raw ? PrismaPermissionMapper.toDomain(raw) : null;
  }

  async findAll(): Promise<Permission[]> {
    const raws = await this.prismaService.permission.findMany();
    return raws.map(PrismaPermissionMapper.toDomain);
  }

  async save(permission: Permission): Promise<void> {
    try {
      const data = PrismaPermissionMapper.toPersistence(permission);
      await this.prismaService.permission.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });
    } catch {
      throw new PersistenceInfrastructureException('Error saving permission');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prismaService.permission.delete({ where: { id } });
    } catch {
      throw new PersistenceInfrastructureException('Error deleting permission');
    }
  }

  async findByUserId(userId: UserId): Promise<Permission[]> {
    const raws = await this.prismaService.userPermission.findMany({
      where: { userId },
      include: { permission: true },
    });

    return raws.map((userPermission) =>
      PrismaPermissionMapper.toDomain(userPermission.permission),
    );
  }
}
