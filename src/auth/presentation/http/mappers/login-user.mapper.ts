import { EmailVo, PasswordVo } from 'src/shared/domain/value-objects';
import { LoginUserDto } from '../dtos';
import { LoginUserCommand } from 'src/auth/domain/ports/inbound/commands/login-user.command';
import { RequestContext } from 'src/shared/infrastructure/decorators/request-metadata.decorator';

export class LoginUserMapper {
  static toCommand(
    dto: LoginUserDto,
    ReqContext: RequestContext,
  ): LoginUserCommand {
    return {
      email: EmailVo.of(dto.email),
      password: PasswordVo.of(dto.password),
      ipAddress: ReqContext.ipAddress,
      userAgent: ReqContext.userAgent,
    };
  }
}
