import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class InvalidOtpCodeException extends DomainException {
  constructor(message: string = 'Invalid OTP code') {
    super(message, 'INVALID_OTP_CODE', HttpStatus.BAD_REQUEST);
  }
}
