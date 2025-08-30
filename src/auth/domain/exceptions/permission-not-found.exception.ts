import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class PermissionNotFoundException extends DomainException {
  constructor(message: string = 'Permission not found') {
    super(message, 'PERMISSION_NOT_FOUND', HttpStatus.NOT_FOUND);
  }
}
