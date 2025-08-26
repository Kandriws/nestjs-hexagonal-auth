import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class OtpCodeRequiredException extends DomainException {
  constructor(message: string = 'OTP code is required') {
    super(message, 'OTP_CODE_REQUIRED', HttpStatus.BAD_REQUEST);
  }
}
