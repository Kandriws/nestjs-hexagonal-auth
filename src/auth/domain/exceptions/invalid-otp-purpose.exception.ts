import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class InvalidOtpPurposeException extends DomainException {
  constructor(message: string = 'Invalid OTP purpose') {
    super(message, 'INVALID_OTP_PURPOSE', HttpStatus.BAD_REQUEST);
  }
}
