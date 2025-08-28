import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class LoginRateLimitExceededException extends DomainException {
  constructor(message: string = 'Login rate limit exceeded') {
    super(message, 'LOGIN_RATE_LIMIT_EXCEEDED', HttpStatus.TOO_MANY_REQUESTS);
  }
}
