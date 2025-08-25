import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class InvalidMethodTwoFactorSettingException extends DomainException {
  constructor(message: string = 'Invalid method for two-factor setting') {
    super(message, 'INVALID_METHOD_TWO_FACTOR_SETTING', HttpStatus.BAD_REQUEST);
  }
}
