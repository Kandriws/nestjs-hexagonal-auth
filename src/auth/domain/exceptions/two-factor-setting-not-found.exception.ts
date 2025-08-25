import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class TwoFactorSettingNotFoundException extends DomainException {
  constructor(message: string = 'Two-factor setting not found') {
    super(message, 'TWO_FACTOR_SETTING_NOT_FOUND', HttpStatus.NOT_FOUND);
  }
}
