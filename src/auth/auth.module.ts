import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './presentation/http/controllers/auth.controller';
import { PrismaModule } from 'src/shared/infrastructure/prisma/prisma.module';
import securityConfig from 'src/shared/infrastructure/config/security.config';
import { SharedModule } from 'src/shared/shared.module';
import jwtConfig from './infrastructure/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { JwtTokenConfigMapper } from './infrastructure/utils/jwt-token-config.util';
import { TokenType } from './domain/enums';
import { jwtModuleFactory } from './infrastructure/config/jwt-module.factory';
import { allAuthProviders } from './auth.providers';

@Module({
  controllers: [AuthController],
  providers: [JwtTokenConfigMapper, ...allAuthProviders],
  imports: [
    PrismaModule,
    SharedModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      useFactory: (cfg) => jwtModuleFactory(TokenType.ACCESS, cfg),
      inject: [jwtConfig.KEY],
    }),
    ConfigModule.forFeature(securityConfig),
  ],
})
export class AuthModule {}
