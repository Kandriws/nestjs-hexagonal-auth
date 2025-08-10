import { Inject, Injectable } from '@nestjs/common';
import { Otp } from 'src/auth/domain/entities';

import { OtpRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/otp.repository.port';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { PrismaOtpMapper } from './mappers/prisma-otp.mapper';
import {
  OtpNotFoundException,
  PersistenceInfrastructureException,
} from 'src/auth/domain/exceptions';
import { UserId } from 'src/shared/domain/types';
import { OtpCode } from 'src/auth/domain/types';
import { OtpPurpose } from 'src/auth/domain/enums';

@Injectable()
export class PrismaOtpRepositoryAdapter implements OtpRepositoryPort {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService,
  ) {}

  async save(otp: Otp): Promise<void> {
    try {
      const data = PrismaOtpMapper.toPersistence(otp);
      await this.prismaService.otp.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });
    } catch (error) {
      throw new PersistenceInfrastructureException(error.message);
    }
  }

  async findByUserIdAndCode(
    userId: UserId,
    otpCode: OtpCode,
  ): Promise<Otp | null> {
    const record = await this.prismaService.otp.findFirst({
      where: { userId: userId, code: otpCode },
    });
    return record ? PrismaOtpMapper.toDomain(record) : null;
  }

  async findActiveOtpByUser(
    userId: UserId,
    purpose: OtpPurpose,
  ): Promise<Otp | null> {
    const record = await this.prismaService.otp.findFirst({
      where: {
        userId,
        purpose: PrismaOtpMapper.convertDomainPurposeToPrisma(purpose),
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
    return record ? PrismaOtpMapper.toDomain(record) : null;
  }

  async delete(otp: Otp): Promise<void> {
    try {
      await this.prismaService.otp.delete({
        where: { id: otp.id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new OtpNotFoundException();
      }

      throw new PersistenceInfrastructureException(`Failed to delete OTP`);
    }
  }
}
