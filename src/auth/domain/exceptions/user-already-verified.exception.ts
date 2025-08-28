import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class UserAlreadyVerifiedException extends DomainException {
  constructor(message: string = 'User is already verified') {
    super(message, 'USER_ALREADY_VERIFIED', HttpStatus.BAD_REQUEST);
  }
}
