import { Inject, Injectable } from '@nestjs/common';
import { TwoFactorSetting } from 'src/auth/domain/entities';
import { TwoFactorSettingRepositoryPort } from 'src/auth/domain/ports/outbound/persistence';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { PrismaTwoFactorSettingMapper } from './mappers/prisma-two-factor-setting.mapper';
import { UserId } from 'src/shared/domain/types';
import {
  PersistenceInfrastructureException,
  TwoFactorSettingAlreadyExistsException,
} from 'src/auth/domain/exceptions';

@Injectable()
export class PrismaTwoFactorSettingRepositoryAdapter
  implements TwoFactorSettingRepositoryPort
{
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService,
  ) {}
  async findByUserId(userId: UserId): Promise<TwoFactorSetting | null> {
    const prismaTwoFactorSetting =
      await this.prismaService.twoFactorSetting.findUnique({
        where: { userId },
      });

    return prismaTwoFactorSetting
      ? PrismaTwoFactorSettingMapper.toDomain(prismaTwoFactorSetting)
      : null;
  }
  async save(twoFactorSetting: TwoFactorSetting): Promise<void> {
    try {
      const prismaTwoFactorSetting =
        PrismaTwoFactorSettingMapper.toPersistence(twoFactorSetting);

      const { userId: _userId, ...createPayload } = prismaTwoFactorSetting;
      await this.prismaService.twoFactorSetting.upsert({
        where: { userId: twoFactorSetting.userId },
        create: {
          ...createPayload,
          user: { connect: { id: _userId } },
        },
        update: prismaTwoFactorSetting,
      });
    } catch (error) {
      if (error && error.code === 'P2002') {
        throw new TwoFactorSettingAlreadyExistsException();
      }
      throw new PersistenceInfrastructureException(
        'Failed to save two-factor setting',
      );
    }
  }
}
