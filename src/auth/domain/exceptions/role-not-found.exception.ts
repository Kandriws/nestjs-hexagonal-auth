import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class RoleNotFoundException extends DomainException {
  constructor(message: string = 'Role not found') {
    super(message, 'ROLE_NOT_FOUND', HttpStatus.NOT_FOUND);
  }
}
