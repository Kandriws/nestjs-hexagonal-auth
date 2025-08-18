import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/auth/domain/entities';
import {
  PersistenceInfrastructureException,
  TokenNotFoundException,
} from 'src/auth/domain/exceptions';
import { TokenRepositoryPort } from 'src/auth/domain/ports/outbound/persistence';
import { UserId } from 'src/shared/domain/types';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { TokenMapper } from './mappers/prisma-token.mapper';

@Injectable()
export class PrismaTokenRepositoryAdapter implements TokenRepositoryPort {
  constructor(
    @Inject(PrismaService)
    private prismaService: PrismaService,
  ) {}

  async findByTokenId(id: string): Promise<Token | null> {
    try {
      const token = await this.prismaService.token.findUnique({
        where: { id },
      });

      if (!token) {
        return null;
      }

      return TokenMapper.toDomain(token);
    } catch {
      throw new PersistenceInfrastructureException(
        `Error finding token by id: ${id}.`,
      );
    }
  }

  async save(token: Token): Promise<void> {
    try {
      await this.prismaService.token.create({
        data: TokenMapper.toPersistence(token),
      });
    } catch {
      throw new PersistenceInfrastructureException(
        'Error saving token to the persistence layer',
      );
    }
  }

  async deleteByTokenId(id: string): Promise<void> {
    try {
      await this.prismaService.token.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new TokenNotFoundException();
      }

      throw new PersistenceInfrastructureException(
        'Error deleting token from the persistence layer',
      );
    }
  }

  async deleteByUserId(userId: UserId): Promise<void> {
    try {
      await this.prismaService.token.deleteMany({
        where: { userId },
      });
    } catch {
      throw new PersistenceInfrastructureException(
        'Error deleting tokens by userId from the persistence layer',
      );
    }
  }

  async rotateToken(oldTokenId: string, newToken: Token): Promise<void> {
    try {
      const createData = TokenMapper.toPersistence(newToken);
      await this.prismaService.$transaction([
        this.prismaService.token.delete({ where: { id: oldTokenId } }),
        this.prismaService.token.create({ data: createData }),
      ]);
    } catch (error) {
      if (error && (error as any).code === 'P2025') {
        throw new TokenNotFoundException();
      }

      throw new PersistenceInfrastructureException(
        'Error rotating token in the persistence layer',
      );
    }
  }
}
