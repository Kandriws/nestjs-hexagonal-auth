import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class InvalidTokenPayloadException extends DomainException {
  constructor(message: string = 'Invalid token payload') {
    super(message, 'INVALID_TOKEN_PAYLOAD', HttpStatus.BAD_REQUEST);
  }
}
