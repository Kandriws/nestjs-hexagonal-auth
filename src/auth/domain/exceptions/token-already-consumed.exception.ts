import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class TokenAlreadyConsumedException extends DomainException {
  constructor(message: string = 'Token has already been consumed') {
    super(message, 'TOKEN_ALREADY_CONSUMED', HttpStatus.BAD_REQUEST);
  }
}
