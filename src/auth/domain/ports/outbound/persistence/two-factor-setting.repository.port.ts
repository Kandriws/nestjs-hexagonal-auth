import { TwoFactorSetting } from 'src/auth/domain/entities';
import { UserId } from 'src/shared/domain/types';

export const TwoFactorSettingRepositoryPort = 'TwoFactorSettingRepositoryPort';

export interface TwoFactorSettingRepositoryPort {
  findByUserId(userId: UserId): Promise<TwoFactorSetting | null>;
  save(twoFactorSetting: TwoFactorSetting): Promise<void>;
}
