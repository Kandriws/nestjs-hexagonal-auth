import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class TokenNotFoundException extends DomainException {
  constructor(message: string = 'Token not found') {
    super(message, 'TOKEN_NOT_FOUND', HttpStatus.NOT_FOUND);
  }
}
