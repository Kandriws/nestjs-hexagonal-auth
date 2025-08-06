import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class UserNotFoundException extends DomainException {
  constructor(message: string = 'User not found') {
    super(message, 'USER_NOT_FOUND', HttpStatus.NOT_FOUND);
  }
}
