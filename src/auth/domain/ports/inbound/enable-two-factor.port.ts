import { UserId } from 'src/shared/domain/types';
import { TwoFactorMethod } from '../../enums';
import { EnableTwoFactorResponse } from '../outbound/commands/enable-two-factor-response';

export const EnableTwoFactorPort = Symbol('EnableTwoFactorPort');

export interface EnableTwoFactorPort {
  execute(
    userId: UserId,
    method: TwoFactorMethod,
  ): Promise<EnableTwoFactorResponse | null>;
}
