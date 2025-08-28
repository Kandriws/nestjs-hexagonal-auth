import { RefreshTokenCommand } from 'src/auth/domain/ports/inbound/commands/refresh-token.command';
import { RefreshTokenDto } from '../dtos';
import { RefreshToken } from 'src/shared/domain/types';
import { RequestContext } from 'src/shared/infrastructure/decorators/request-metadata.decorator';

export class RefreshTokenMapper {
  static toCommand(
    dto: RefreshTokenDto,
    ReqContext: RequestContext,
  ): RefreshTokenCommand {
    return {
      refreshToken: dto.refreshToken as RefreshToken,
      ipAddress: ReqContext.ipAddress,
      userAgent: ReqContext.userAgent,
    };
  }
}
