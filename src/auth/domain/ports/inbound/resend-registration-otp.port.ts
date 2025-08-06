import { EmailVo } from 'src/shared/domain/value-objects';
export const ResendRegistrationOtpPort = Symbol('ResendRegistrationOtpPort');
export interface ResendRegistrationOtpPort {
  execute(email: EmailVo): Promise<void>;
}
