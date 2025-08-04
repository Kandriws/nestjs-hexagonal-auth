import { DomainException } from './domain.exception';
import { HttpStatus } from '../enums/http-status.enum';

export class InvalidNameException extends DomainException {
  constructor(message: string = 'Invalid name format') {
    super(message, 'INVALID_NAME', HttpStatus.BAD_REQUEST);
  }
}
