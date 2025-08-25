import { TwoFactorMethod } from 'src/auth/domain/enums';
import { EnableTwoFactorDto } from '../dtos/enable-two-factor.dto';
import { UserId } from 'src/shared/domain/types';

export class EnableTwoFactorMapper {
  static toCommand(dto: EnableTwoFactorDto): {
    userId: UserId;
    method: TwoFactorMethod;
  } {
    return {
      userId: dto.userId as UserId,
      method: dto.method as TwoFactorMethod,
    };
  }
}
