import Stream from 'node:stream';
import { MailerEmailVo } from '../value-objects';

export interface SendMailDto {
  to: MailerEmailVo[];
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | Stream | string;
  }>;
  cc?: MailerEmailVo[];
}
