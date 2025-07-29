import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { DomainException } from 'src/shared/domain/exceptions';

export class PersistenceInfrastructureException extends DomainException {
  constructor(message: string = 'An error occurred in the persistence layer') {
    super(
      message,
      'PERSISTENCE_INFRASTRUCTURE_ERROR',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
