import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class UnknownOtpChannelException extends DomainException {
  constructor(message: string = 'Unknown OTP policy channel') {
    super(message, 'UNKNOWN_OTP_CHANNEL', HttpStatus.BAD_REQUEST);
  }
}
