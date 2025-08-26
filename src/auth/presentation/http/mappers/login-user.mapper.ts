import { EmailVo, PasswordVo } from 'src/shared/domain/value-objects';
import { LoginUserDto } from '../dtos';
import { LoginUserCommand } from 'src/auth/domain/ports/inbound/commands/login-user.command';
import { RequestContext } from 'src/shared/infrastructure/decorators/request-metadata.decorator';
import { OtpCodeVo } from 'src/auth/domain/value-objects';

export class LoginUserMapper {
  static toCommand(
    dto: LoginUserDto,
    ReqContext: RequestContext,
  ): LoginUserCommand {
    return {
      email: EmailVo.of(dto.email),
      password: PasswordVo.of(dto.password),
      otpCode: dto.otpCode ? OtpCodeVo.of(dto.otpCode) : undefined,
      ipAddress: ReqContext.ipAddress,
      userAgent: ReqContext.userAgent,
    };
  }
}
