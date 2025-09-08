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
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import appConfig from 'src/shared/infrastructure/config/app.config';
import { RoleController } from './presentation/http/controllers/role.controller';
import { roleProviders } from './role.providers';
import { PermissionController } from './presentation/http/controllers/permission.controller';
import { permissionProviders } from './permission.providers';
import { UserController } from './presentation/http/controllers/user.controller';

@Module({
  controllers: [
    AuthController,
    PermissionController,
    RoleController,
    UserController,
  ],
  providers: [
    JwtTokenConfigMapper,
    JwtStrategy,
    ...allAuthProviders,
    ...roleProviders,
    ...permissionProviders,
  ],
  imports: [
    PassportModule,
    PrismaModule,
    SharedModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      useFactory: (cfg) => jwtModuleFactory(TokenType.ACCESS, cfg),
      inject: [jwtConfig.KEY],
    }),
    ConfigModule.forFeature(securityConfig),
    ConfigModule.forFeature(appConfig),
  ],
})
export class AuthModule {}
