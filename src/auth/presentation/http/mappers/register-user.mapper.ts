import { RegisterUserCommand } from 'src/auth/domain/ports/inbound/commands/register-user.command';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { EmailVo, NameVo, PasswordVo } from 'src/shared/domain/value-objects';

export class RegisterUserMapper {
  static toCommand(dto: RegisterUserDto): RegisterUserCommand {
    return {
      email: EmailVo.of(dto.email),
      password: PasswordVo.of(dto.password),
      firstName: NameVo.of(dto.firstName),
      lastName: NameVo.of(dto.lastName),
    };
  }
}
