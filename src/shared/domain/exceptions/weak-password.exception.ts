import { HttpStatus } from '../enums/http-status.enum';
import { DomainException } from './domain.exception';

export class WeakPasswordException extends DomainException {
  constructor(
    message: string = 'Weak password. Password must be at least 8 characters long and contain a mix of letters, numbers, and special characters.',
  ) {
    super(message, 'WEAK_PASSWORD', HttpStatus.CONFLICT);
  }
}
