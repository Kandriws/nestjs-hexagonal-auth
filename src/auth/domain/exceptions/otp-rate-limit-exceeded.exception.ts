import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class OtpRateLimitExceededException extends DomainException {
  constructor(message: string = 'OTP rate limit exceeded') {
    super(message, 'OTP_RATE_LIMIT_EXCEEDED', HttpStatus.TOO_MANY_REQUESTS);
  }
}
