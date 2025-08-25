import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { JwtAuthGuard } from './auth/infrastructure/guards';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [AuthModule, SharedModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
