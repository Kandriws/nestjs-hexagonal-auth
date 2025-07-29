import { SendMailDto } from 'src/shared/domain/dtos';
export const MailerPort = Symbol('MailerPort');

export interface MailerPort {
  sendEmail(dto: SendMailDto): Promise<void>;
}
