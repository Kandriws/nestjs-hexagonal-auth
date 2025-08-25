import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class TwoFactorSettingAlreadyEnabledException extends DomainException {
  constructor(message: string = 'Two-factor setting is already enabled') {
    super(message, 'TWO_FACTOR_SETTING_ALREADY_ENABLED', HttpStatus.CONFLICT);
  }
}
