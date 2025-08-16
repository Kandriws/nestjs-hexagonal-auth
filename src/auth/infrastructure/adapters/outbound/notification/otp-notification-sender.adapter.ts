import { Inject, Injectable } from '@nestjs/common';
import { OtpChannel } from 'src/auth/domain/enums';
import {
  OtpNotificationContext,
  OtpNotificationPort,
} from 'src/auth/domain/ports/outbound/notification';
import { MailerPort } from 'src/shared/domain/ports/outbound/notification/mailer.port';
import { MailerEmailVo } from 'src/shared/domain/value-objects';

@Injectable()
export class OtpNotificationSenderAdapter implements OtpNotificationPort {
  constructor(
    @Inject(MailerPort)
    private readonly mailer: MailerPort,
  ) {}

  async send(
    channel: OtpChannel,
    to: string[],
    ctx: OtpNotificationContext,
  ): Promise<void> {
    switch (channel) {
      case OtpChannel.EMAIL:
        // TODO: Implement template rendering logic
        const subject = 'Your OTP Code';
        const body = this.generateOtpTemplate(ctx.code.getValue(), ctx.ttl);
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

  private generateOtpTemplate(otpCode: string, ttl: number): string {
    return `
      <h1>Your OTP Code</h1>
      <p>Please use the following code to complete your registration:</p>
      <h2>${otpCode}</h2>
      <p>This code is valid for ${ttl} minutes.</p>
    `;
  }
}
