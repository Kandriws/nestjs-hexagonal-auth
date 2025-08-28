import { Inject, Injectable } from '@nestjs/common';
import { OtpChannel } from 'src/auth/domain/enums';
import {
  OtpNotificationContext,
  OtpNotificationPort,
} from 'src/auth/domain/ports/outbound/notification';
import { MailerPort } from 'src/shared/domain/ports/outbound/notification/mailer.port';
import { MailerEmailVo } from 'src/shared/domain/value-objects';
import { EmailTemplateRendererPort } from 'src/shared/domain/ports/outbound/notification/email-template-renderer.port';

@Injectable()
export class OtpNotificationSenderAdapter implements OtpNotificationPort {
  constructor(
    @Inject(MailerPort)
    private readonly mailer: MailerPort,
    @Inject(EmailTemplateRendererPort)
    private readonly templateRenderer: EmailTemplateRendererPort,
  ) {}

  async send(
    channel: OtpChannel,
    to: string[],
    ctx: OtpNotificationContext,
  ): Promise<void> {
    switch (channel) {
      case OtpChannel.EMAIL:
        const subject = 'Your OTP Code';
        const body = await this.templateRenderer.render('otp-email', {
          code: ctx.code.getValue(),
          ttl: ctx.ttl,
        });
        const emails = to.map((email) => MailerEmailVo.of(email));
        return this.mailer.send({
          to: emails,
          subject,
          body,
        });
      case OtpChannel.SMS:
        throw new Error('SMS channel not implemented');
      default:
        throw new Error(`Unsupported channel: ${channel}`);
    }
  }
}
