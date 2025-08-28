import { EmailVo, NameVo, PasswordVo } from 'src/shared/domain/value-objects';

export interface RegisterUserCommand {
  email: EmailVo;
  password: PasswordVo;
  firstName: NameVo;
  lastName: NameVo;
}
