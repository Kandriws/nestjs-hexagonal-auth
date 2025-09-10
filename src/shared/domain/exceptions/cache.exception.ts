import { HttpStatus } from '../enums/http-status.enum';
import { DomainException } from './domain.exception';

export class CacheException extends DomainException {
  constructor(message: string = 'Cache operation failed') {
    super(message, 'CACHE_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
