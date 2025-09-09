import { EmailVo, NameVo } from 'src/shared/domain/value-objects';
import { RequestContext } from 'src/shared/infrastructure/decorators/request-metadata.decorator';

export class LoginWithGoogleMapper {
  static toCommand(profile: any, requestContext: RequestContext) {
    return {
      email: EmailVo.of(profile.email),
      firstName: NameVo.of(profile.firstName || 'User'),
      lastName: NameVo.of(profile.lastName || 'Google'),
      providerId: profile.id,
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
    };
  }
}
