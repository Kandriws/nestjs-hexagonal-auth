import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class InvalidCredentialsException extends DomainException {
  constructor(message: string = 'Invalid credentials') {
    super(message, 'INVALID_CREDENTIALS', HttpStatus.UNAUTHORIZED);
  }
}
