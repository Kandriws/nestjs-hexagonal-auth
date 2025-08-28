import { ResetPasswordCommand } from 'src/auth/domain/ports/inbound';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { PasswordVo } from 'src/shared/domain/value-objects';

export class ResetPasswordMapper {
  static toCommand(dto: ResetPasswordDto): ResetPasswordCommand {
    return {
      token: dto.token,
      newPassword: PasswordVo.of(dto.newPassword),
    };
  }
}
