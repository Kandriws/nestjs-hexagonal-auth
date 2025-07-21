import { RegisterUserCommand } from 'src/auth/domain/ports/inbound/commands/register.command';
import { RegisterUserDto } from '../dtos/register-user.dto';

export class RegisterUserMapper {
  static toCommand(dto: RegisterUserDto): RegisterUserCommand {
    return {
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
    };
  }
}
