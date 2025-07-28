import { DomainException } from './domain.exception';
import { HttpStatus } from '../enums/http-status.enum';

export class MissingAuthTokensException extends DomainException {
  constructor(message: string = 'Missing authentication tokens') {
    super(message, 'MISSING_AUTH_TOKENS', HttpStatus.UNAUTHORIZED);
  }
}
