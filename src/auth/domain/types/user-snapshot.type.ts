import { NameVo } from 'src/shared/domain/value-objects/name.vo';
import { PasswordVo } from 'src/shared/domain/value-objects/password.vo';
import { EmailVo } from 'src/shared/domain/value-objects/email.vo';
import { UserId } from 'src/shared/domain/types';

export interface UserSnapshotType {
  id: UserId;
  email: EmailVo;
  password: PasswordVo;
  firstName: NameVo;
  lastName: NameVo;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  /* It will be implemented later */
  //isEmailVerified: boolean;
  //verifiedAt?: Date;
  //security: UserSecurityVo;
}
