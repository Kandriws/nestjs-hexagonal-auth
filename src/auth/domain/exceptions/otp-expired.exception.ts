import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class OtpExpiredException extends DomainException {
  constructor(message: string = 'OTP has expired') {
    super(message, 'OTP_EXPIRED', HttpStatus.UNAUTHORIZED);
  }
}
