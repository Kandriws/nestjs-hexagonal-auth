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
    } catch (error) {
      throw new PersistenceInfrastructureException(
        `Error finding token by id: ${id}. ${error.message}`,
      );
    }
  }

  async save(token: Token): Promise<void> {
    try {
      await this.prismaService.token.create({
        data: TokenMapper.toPersistence(token),
      });
    } catch (error) {
      throw new PersistenceInfrastructureException(
        `Error saving token: ${error.message}`,
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
        `Error deleting token by id: ${id}. ${error.message}`,
      );
    }
  }

  async deleteByUserId(userId: UserId): Promise<void> {
    try {
      await this.prismaService.token.deleteMany({
        where: { userId },
      });
    } catch (error) {
      throw new PersistenceInfrastructureException(
        `Error deleting token by userId: ${userId}. ${error.message}`,
      );
    }
  }
}
