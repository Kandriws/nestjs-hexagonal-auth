import { DomainException } from './domain.exception';
import { HttpStatus } from '../enums/http-status.enum';

export class MailDeliveryException extends DomainException {
  constructor(message: string = 'Failed to deliver email') {
    super(message, 'MAIL_DELIVERY_FAILED', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
