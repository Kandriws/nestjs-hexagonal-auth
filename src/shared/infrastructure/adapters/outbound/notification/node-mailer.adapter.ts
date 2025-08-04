import { Inject, Injectable } from '@nestjs/common';
import { SendMailDto } from 'src/shared/domain/dtos';
import { MailerPort } from 'src/shared/domain/ports/outbound/notification/mailer.port';
import mailerConfig from 'src/shared/infrastructure/config/mailer.config';
import { MailerEmailVo } from 'src/shared/domain/value-objects';
import { MailDeliveryException } from 'src/shared/domain/exceptions';
import { Readable } from 'node:stream';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NodeMailerAdapter implements MailerPort {
  private transporter: nodemailer.Transporter;
  constructor(
    @Inject(mailerConfig.KEY)
    private readonly config: ReturnType<typeof mailerConfig>,
  ) {
    this.transporter = nodemailer.createTransport(config);
  }
  async send(dto: SendMailDto): Promise<void> {
    const mailOptions = {
      from: this.config.from,
      to: this.toAddressString(dto.to),
      subject: dto.subject,
      html: dto.body,
      cc: dto.cc ? this.toAddressString(dto.cc) : undefined,
      attachments: dto.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content as string | Buffer | Readable,
      })),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch {
      throw new MailDeliveryException();
    }
  }

  private toAddressString(list: MailerEmailVo[]): string {
    console.log('Converting email list to string:', list);
    return list.map((emailVo) => emailVo.getValue()).join(', ');
  }
}
