import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class OtpAlreadyUsedException extends DomainException {
  constructor(message: string = 'OTP has already been used') {
    super(message, 'OTP_ALREADY_USED', HttpStatus.BAD_REQUEST);
  }
}
