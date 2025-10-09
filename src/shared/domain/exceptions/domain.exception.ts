import { HttpStatus } from '../enums/http-status.enum';

export abstract class DomainException extends Error {
  constructor(
    message: string,
    readonly code: string = 'UNKNOWN_ERROR',
    readonly statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    readonly data?: any[],
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
