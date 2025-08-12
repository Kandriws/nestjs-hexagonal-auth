import { EmailVo, PasswordVo } from 'src/shared/domain/value-objects';
import { LoginUserDto } from '../dtos';
import { LoginUserCommand } from 'src/auth/domain/ports/inbound/commands/login-user.command';

export class LoginUserMapper {
  static toCommand(
    dto: LoginUserDto,
    ipAddress: string,
    userAgent: string,
  ): LoginUserCommand {
    return {
      email: EmailVo.of(dto.email),
      password: PasswordVo.of(dto.password),
      ipAddress,
      userAgent,
    };
  }
}
