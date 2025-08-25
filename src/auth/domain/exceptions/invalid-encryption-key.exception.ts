import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class InvalidEncryptionKeyException extends DomainException {
  constructor(message: string = 'Invalid encryption key') {
    super(message, 'INVALID_ENCRYPTION_KEY', HttpStatus.BAD_REQUEST);
  }
}
