import { UserId } from 'src/shared/domain/types';
import { UserSnapshotModel } from '../model/user-snapshot.model';
import { EmailVo, NameVo, PasswordVo } from 'src/shared/domain/value-objects';
import { UserSecurityVo } from '../value-objects/user-security.vo';
import { LockPolicy } from '../services/interfaces/lock-policy.interface';

export class User {
  private constructor(private readonly snap: UserSnapshotModel) {}

  static create(
    id: UserId,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): User {
    const now = new Date();
    return new User({
      id,
      email: EmailVo.of(email),
      password: PasswordVo.of(password),
      firstName: NameVo.of(firstName),
      lastName: NameVo.of(lastName),
      isEmailVerified: false,
      createdAt: now,
      updatedAt: now,
      security: UserSecurityVo.create(),
    });
  }

  markEmailAsVerified(): User {
    return new User({
      ...this.snap,
      isEmailVerified: true,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  incrementFailedLoginAttempt(now: Date, policy: LockPolicy): User {
    return new User({
      ...this.snap,
      security: this.snap.security.incrementFailedLoginAttempt(policy),
      updatedAt: now,
    });
  }

  get id() {
    return this.snap.id;
  }
  get email() {
    return this.snap.email;
  }
  get password() {
    return this.snap.password;
  }
  get firstName() {
    return this.snap.firstName;
  }
  get lastName() {
    return this.snap.lastName;
  }
  get isEmailVerified() {
    return this.snap.isEmailVerified;
  }
  get verifiedAt() {
    return this.snap.verifiedAt;
  }
  get createdAt() {
    return this.snap.createdAt;
  }
  get updatedAt() {
    return this.snap.updatedAt;
  }
  get security() {
    return this.snap.security;
  }

  equals(other: User): boolean {
    return other instanceof User && other.id === this.id;
  }
}
