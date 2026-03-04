import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import mailerConfig from './infrastructure/config/mailer.config';
import redisConfig from './infrastructure/config/cache.config';
import { MailerPort } from './domain/ports/outbound/notification/mailer.port';
import { NodeMailerAdapter } from './infrastructure/adapters/outbound/notification/node-mailer.adapter';
import { EmailTemplateRendererPort } from './domain/ports/outbound/notification/email-template-renderer.port';
import { MjmlTemplateRendererAdapter } from './infrastructure/adapters/outbound/notification/mjml-template-renderer.adapter';
import { CachePort } from './domain/ports/outbound/cache/cache.port';
import appConfig from './infrastructure/config/app.config';
import { RedisCacheAdapter } from './infrastructure/adapters/outbound/cache/redis-cache.adapter';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthController } from './infrastructure/controllers/health.controller';

@Global()
@Module({
  controllers: [HealthController],
  providers: [
    {
      provide: MailerPort,
      useClass: NodeMailerAdapter,
    },
    {
      provide: EmailTemplateRendererPort,
      useClass: MjmlTemplateRendererAdapter,
    },
    {
      provide: CachePort,
      useClass: RedisCacheAdapter,
    },
  ],
  imports: [
    TerminusModule,
    PrismaModule,
    ConfigModule.forFeature(mailerConfig),
    ConfigModule.forFeature(redisConfig),
    ConfigModule.forFeature(appConfig),
  ],
  exports: [MailerPort, EmailTemplateRendererPort, CachePort],
})
export class SharedModule {}
