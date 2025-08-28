import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class InvalidTotpCodeException extends DomainException {
  constructor(message: string = 'Invalid TOTP code') {
    super(message, 'INVALID_TOTP_CODE', HttpStatus.BAD_REQUEST);
  }
}
