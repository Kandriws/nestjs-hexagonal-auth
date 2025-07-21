import { User } from 'src/auth/domain/entities/user.entity';
import { UserRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/user.repository.port';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { PrismaUserMapper } from './mappers/prisma-user.mapper';

export class PrismaUserRepositoryAdapter implements UserRepositoryPort {
  constructor(private readonly prismaService: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
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
        email: prismaUser.email,
        password: prismaUser.password,
        firstName: prismaUser.firstName,
        lastName: prismaUser.lastName,
        updatedAt: new Date(),
      },
      create: {
        id: user.id,
        email: prismaUser.email,
        password: prismaUser.password,
        firstName: prismaUser.firstName,
        lastName: prismaUser.lastName,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}
