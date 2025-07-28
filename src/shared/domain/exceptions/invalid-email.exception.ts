import { HttpStatus } from '../enums/http-status.enum';
import { DomainException } from './domain.exception';

export class InvalidEmailException extends DomainException {
  constructor(message: string = 'Invalid email format') {
    super(message, 'INVALID_EMAIL', HttpStatus.BAD_REQUEST);
  }
}
