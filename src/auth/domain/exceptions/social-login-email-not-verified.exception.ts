import { DomainException } from 'src/shared/domain/exceptions';
import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';

export class SocialLoginEmailNotVerifiedException extends DomainException {
  constructor(message: string = 'Email not verified for social login') {
    super(message, 'SOCIAL_LOGIN_EMAIL_NOT_VERIFIED', HttpStatus.UNAUTHORIZED);
  }
}
