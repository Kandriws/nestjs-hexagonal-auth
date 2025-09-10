import { Inject, Injectable } from '@nestjs/common';
import { OAuthLoginPort } from 'src/auth/domain/ports/inbound/oauth-login.port';
import { OAuthLoginCommand } from 'src/auth/domain/ports/inbound/commands/oauth-login.command';
import { AuthTokensResponse } from 'src/auth/domain/ports/inbound/commands/auth-tokens-response';
import {
  UserRepositoryPort,
  TokenRepositoryPort,
  RoleRepositoryPort,
  PermissionRepositoryPort,
} from 'src/auth/domain/ports/outbound/persistence';
import {
  TokenProviderPort,
  UUIDPort,
  HasherPort,
} from 'src/auth/domain/ports/outbound/security';
import { TokenType } from 'src/auth/domain/enums';
import { Token } from 'src/auth/domain/entities';
import { Permission } from 'src/auth/domain/entities/permission.entity';
import { Role } from 'src/auth/domain/entities/role.entity';
import { User } from 'src/auth/domain/entities/user.entity';
import { UserId } from 'src/shared/domain/types';

@Injectable()
export class LoginWithGoogleUseCase implements OAuthLoginPort {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
    @Inject(TokenProviderPort)
    private readonly tokenProvider: TokenProviderPort,
    @Inject(TokenRepositoryPort)
    private readonly tokenRepository: TokenRepositoryPort,
    @Inject(RoleRepositoryPort)
    private readonly roleRepository: RoleRepositoryPort,
    @Inject(PermissionRepositoryPort)
    private readonly permissionRepository: PermissionRepositoryPort,
    @Inject(UUIDPort)
    private readonly uuid: UUIDPort,
    @Inject(HasherPort)
    private readonly hasher: HasherPort,
  ) {}

  async execute(command: OAuthLoginCommand): Promise<AuthTokensResponse> {
    let user = await this.userRepository.findByEmail(command.email.getValue());

    if (!user) {
      const randomPassword = await this.hasher.hash(this.uuid.generate());
      user = User.create({
        id: this.uuid.generate() as UserId,
        email: command.email.getValue(),
        password: randomPassword,
        firstName: command.firstName.getValue(),
        lastName: command.lastName.getValue(),
      });

      user.markAsVerified();
      await this.userRepository.save(user);
    }

    const tokenId = this.uuid.generate();
    const roles = await this.roleRepository.findByUserId(user.id);
    const permissions = await this.permissionRepository.findByUserId(user.id);

    const accessToken = await this.tokenProvider.generate(
      user.id,
      user.email,
      TokenType.ACCESS,
      {
        roles: roles.map((role: Role) => ({
          name: role.name,
          realm: role.realm,
        })),
        permissions: permissions.map((p: Permission) => ({
          name: p.name,
          realm: p.realm,
        })),
      },
    );

    const refreshToken = await this.tokenProvider.generate(
      user.id,
      user.email,
      TokenType.REFRESH,
      { jti: tokenId },
    );

    const decodedRefreshToken = await this.tokenProvider.decode(refreshToken);

    const token = Token.create({
      id: tokenId,
      userId: user.id,
      type: TokenType.REFRESH,
      expiresAt: decodedRefreshToken.getExpiresAt(),
      metadata: {
        ipAddress: command.ipAddress,
        userAgent: command.userAgent,
        provider: 'google',
        providerId: command.providerId,
      } as any,
    });

    await this.tokenRepository.save(token);

    return {
      accessToken: accessToken as any,
      refreshToken: refreshToken as any,
    };
  }
}
