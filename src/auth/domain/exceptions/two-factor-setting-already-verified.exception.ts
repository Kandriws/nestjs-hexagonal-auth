import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class TwoFactorSettingAlreadyVerifiedException extends DomainException {
  constructor(message: string = 'Two-factor setting is already verified') {
    super(message, 'TWO_FACTOR_SETTING_ALREADY_VERIFIED', HttpStatus.CONFLICT);
  }
}
