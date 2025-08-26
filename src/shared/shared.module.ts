import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import mailerConfig from './infrastructure/config/mailer.config';
import { MailerPort } from './domain/ports/outbound/notification/mailer.port';
import { NodeMailerAdapter } from './infrastructure/adapters/outbound/notification/node-mailer.adapter';
import { EmailTemplateRendererPort } from './domain/ports/outbound/notification/email-template-renderer.port';
import { MjmlTemplateRendererAdapter } from './infrastructure/adapters/outbound/notification/mjml-template-renderer.adapter';
import appConfig from './infrastructure/config/app.config';

@Global()
@Module({
  controllers: [],
  providers: [
    {
      provide: MailerPort,
      useClass: NodeMailerAdapter,
    },
    {
      provide: EmailTemplateRendererPort,
      useClass: MjmlTemplateRendererAdapter,
    },
  ],
  imports: [
    ConfigModule.forFeature(mailerConfig),
    ConfigModule.forFeature(appConfig),
  ],
  exports: [MailerPort, EmailTemplateRendererPort],
})
export class SharedModule {}
