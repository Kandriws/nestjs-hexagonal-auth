import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class UserNotVerifiedException extends DomainException {
  constructor(message: string = 'User is not verified') {
    super(message, 'USER_NOT_VERIFIED', HttpStatus.UNAUTHORIZED);
  }
}
