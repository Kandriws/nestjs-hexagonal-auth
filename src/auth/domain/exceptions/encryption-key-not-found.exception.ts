import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class EncryptionKeyNotFoundException extends DomainException {
  constructor(message: string = 'Encryption key not found') {
    super(message, 'ENCRYPTION_KEY_NOT_FOUND', HttpStatus.NOT_FOUND);
  }
}
