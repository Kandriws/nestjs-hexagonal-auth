import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import mailerConfig from './infrastructure/config/mailer.config';
import { MailerPort } from './domain/ports/outbound/notification/mailer.port';
import { NodeMailerAdapter } from './infrastructure/adapters/outbound/notification/node-mailer.adapter';

@Global()
@Module({
  controllers: [],
  providers: [
    {
      provide: MailerPort,
      useClass: NodeMailerAdapter,
    },
  ],
  imports: [ConfigModule.forFeature(mailerConfig)],
  exports: [MailerPort],
})
export class SharedModule {}
