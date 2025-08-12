import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class UserSessionExpirationException extends DomainException {
  constructor(message: string = 'Expiration date must be in the future') {
    super(message, 'USER_SESSION_EXPIRATION', HttpStatus.BAD_REQUEST);
  }
}
