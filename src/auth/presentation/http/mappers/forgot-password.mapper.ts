import { ForgotPasswordCommand } from 'src/auth/domain/ports/inbound';
import { ForgotPasswordDto } from '../dtos';
import { RequestContext } from 'src/shared/infrastructure/decorators/request-metadata.decorator';
import { EmailVo } from 'src/shared/domain/value-objects';

export class ForgotPasswordMapper {
  static toCommand(
    dto: ForgotPasswordDto,
    reqContext: RequestContext,
  ): ForgotPasswordCommand {
    return {
      email: EmailVo.of(dto.email),
      ipAddress: reqContext.ipAddress,
      userAgent: reqContext.userAgent,
    };
  }
}
