import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class TwoFactorSettingAlreadyExistsException extends DomainException {
  constructor(message: string = 'Two-factor setting already exists') {
    super(message, 'TWO_FACTOR_SETTING_ALREADY_EXISTS', HttpStatus.CONFLICT);
  }
}
