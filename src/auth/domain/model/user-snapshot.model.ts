import { NameVo } from 'src/shared/domain/value-objects/name.vo';
import { UserSecurityVo } from '../value-objects/user-security.vo';
import { PasswordVo } from 'src/shared/domain/value-objects/password.vo';
import { EmailVo } from 'src/shared/domain/value-objects/email.vo';
import { UserId } from 'src/shared/domain/types';

export interface UserSnapshotModel {
  id: UserId;
  email: EmailVo;
  password: PasswordVo;
  firstName: NameVo;
  lastName: NameVo;
  isEmailVerified: boolean;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  security: UserSecurityVo;
}
