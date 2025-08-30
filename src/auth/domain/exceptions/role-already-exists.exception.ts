import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class RoleAlreadyExistsException extends DomainException {
  constructor(message: string = 'Role with the given name already exists') {
    super(message, 'ROLE_ALREADY_EXISTS', HttpStatus.CONFLICT);
  }
}
