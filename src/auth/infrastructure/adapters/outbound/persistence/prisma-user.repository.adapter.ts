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
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    return user ? PrismaUserMapper.toDomain(user) : null;
  }

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
    try {
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
    } catch (error) {
      if (error && error.code === 'P2002') {
        throw new UserAlreadyExistsException();
      }

      throw new PersistenceInfrastructureException(
        'Error saving user to the persistence layer',
      );
    }
  }
}
