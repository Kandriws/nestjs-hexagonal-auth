import { Inject, Injectable } from '@nestjs/common';
import { ResetPasswordNotifierPort } from 'src/auth/domain/ports/outbound/notification/reset-password-notifier.port';
import { MailerPort } from 'src/shared/domain/ports/outbound/notification/mailer.port';
import { SendMailDto } from 'src/shared/domain/dtos';
import { MailerEmailVo } from 'src/shared/domain/value-objects';
import { EmailTemplateRendererPort } from 'src/shared/domain/ports/outbound/notification/email-template-renderer.port';
import appConfig from 'src/shared/infrastructure/config/app.config';

@Injectable()
export class ResetPasswordNotifierAdapter implements ResetPasswordNotifierPort {
  constructor(
    @Inject(MailerPort) private readonly mailer: MailerPort,
    @Inject(appConfig.KEY)
    private readonly appCfg: ReturnType<typeof appConfig>,
    @Inject(EmailTemplateRendererPort)
    private readonly templateRenderer: EmailTemplateRendererPort,
  ) {}

  async sendReset(params: {
    to: MailerEmailVo;
    token: string;
    expiresAt?: Date;
    metadata?: Record<string, any>;
    name?: string;
  }): Promise<void> {
    const frontendUrl = this.appCfg.resetPasswordFrontendUrl;
    const resetLink = `${frontendUrl}?token=${encodeURIComponent(params.token)}`;

    const html = await this.templateRenderer.render('reset-password', {
      name: params.name,
      resetLink,
      expiresAt: params.expiresAt
        ? new Date(params.expiresAt).toUTCString()
        : undefined,
    });

    const mail: SendMailDto = {
      to: [params.to],
      subject: 'Reset your password',
      body: html,
    };

    await this.mailer.send(mail);
  }
}
