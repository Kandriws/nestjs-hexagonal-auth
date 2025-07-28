import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class UserAlreadyExistsException extends DomainException {
  constructor(message: string = 'User already exists') {
    super(message, 'USER_ALREADY_EXISTS', HttpStatus.CONFLICT);
  }
}
