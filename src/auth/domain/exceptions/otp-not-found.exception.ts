import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class OtpNotFoundException extends DomainException {
  constructor(message: string = 'OTP not found') {
    super(message, 'OTP_NOT_FOUND', HttpStatus.NOT_FOUND);
  }
}
