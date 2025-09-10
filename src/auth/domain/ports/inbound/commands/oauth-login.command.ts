import { EmailVo, NameVo } from 'src/shared/domain/value-objects';

export interface OAuthLoginCommand {
  email: EmailVo;
  firstName: NameVo;
  lastName: NameVo;
  ipAddress: string;
  userAgent: string;
  providerId: string;
}
