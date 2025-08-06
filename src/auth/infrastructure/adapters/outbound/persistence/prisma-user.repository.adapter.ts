import { User } from 'src/auth/domain/entities/user.entity';
import { UserRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/user.repository.port';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { PrismaUserMapper } from './mappers/prisma-user.mapper';
import { Inject } from '@nestjs/common';
import { Email } from 'src/shared/domain/types';

export class PrismaUserRepositoryAdapter implements UserRepositoryPort {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService,
  ) {}

  async findByEmail(email: Email): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }
    return PrismaUserMapper.toDomain(user);
  }

  async save(user: User): Promise<void> {
    const prismaUser = PrismaUserMapper.toPersistence(user);

    await this.prismaService.user.upsert({
      where: { id: user.id },
      update: {
        ...prismaUser,
      },
      create: {
        id: user.id,
        ...prismaUser,
      },
    });
  }
}
