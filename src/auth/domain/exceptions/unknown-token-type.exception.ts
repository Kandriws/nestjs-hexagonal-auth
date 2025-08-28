import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class UnknownTokenTypeException extends DomainException {
  constructor(message: string = 'Unknown token type') {
    super(message, 'UNKNOWN_TOKEN_TYPE', HttpStatus.BAD_REQUEST);
  }
}
