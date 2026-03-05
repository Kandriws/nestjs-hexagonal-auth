import { User } from 'src/auth/domain/entities/user.entity';
import { UserRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/user.repository.port';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { PrismaUserMapper } from './mappers/prisma-user.mapper';
import { Inject, Injectable } from '@nestjs/common';
import { Email, UserId } from 'src/shared/domain/types';
import { PersistenceInfrastructureException } from 'src/auth/domain/exceptions';
import { UserAlreadyExistsException } from 'src/auth/domain/exceptions';

@Injectable()
export class PrismaUserRepositoryAdapter implements UserRepositoryPort {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService,
  ) {}

  async findById(id: UserId): Promise<User | null> {
    const prisma = this.prismaService.getClient();
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user ? PrismaUserMapper.toDomain(user) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const prisma = this.prismaService.getClient();
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }
    return PrismaUserMapper.toDomain(user);
  }

  async findAll(): Promise<User[]> {
    const prisma = this.prismaService.getClient();
    const users = await prisma.user.findMany();
    return users.map(PrismaUserMapper.toDomain);
  }

  async save(user: User): Promise<void> {
    const prismaUser = PrismaUserMapper.toPersistence(user);
    try {
      const prisma = this.prismaService.getClient();
      await prisma.user.upsert({
        where: { id: user.id },
        update: {
          ...prismaUser,
        },
        create: {
          id: user.id,
          ...prismaUser,
        },
      });
    } catch (error) {
      if ((error as any)?.code === 'P2002') {
        throw new UserAlreadyExistsException();
      }

      throw new PersistenceInfrastructureException(
        'Error saving user to the persistence layer',
      );
    }
  }

  async assignRoles(
    userId: string,
    roleIds: string[],
    assignedById?: string | null,
  ): Promise<void> {
    try {
      await this.prismaService.runInTransaction(async () => {
        const prisma = this.prismaService.getClient();

        await prisma.userRole.deleteMany({ where: { userId } });

        if (!roleIds || roleIds.length === 0) return;

        const data = roleIds.map((roleId) => ({
          userId,
          roleId,
          assignedById: assignedById ?? null,
        }));

        await prisma.userRole.createMany({
          data,
          skipDuplicates: true,
        });
      });
    } catch {
      throw new PersistenceInfrastructureException(
        'Error assigning roles to user',
      );
    }
  }

  async assignPermissions(
    userId: string,
    permissionIds: string[],
    assignedById?: string | null,
  ): Promise<void> {
    try {
      await this.prismaService.runInTransaction(async () => {
        const prisma = this.prismaService.getClient();

        await prisma.userPermission.deleteMany({ where: { userId } });

        if (!permissionIds || permissionIds.length === 0) return;

        const data = permissionIds.map((permissionId) => ({
          userId,
          permissionId,
          assignedById: assignedById ?? null,
        }));

        await prisma.userPermission.createMany({
          data,
          skipDuplicates: true,
        });
      });
    } catch {
      throw new PersistenceInfrastructureException(
        'Error assigning permissions to user',
      );
    }
  }
}
