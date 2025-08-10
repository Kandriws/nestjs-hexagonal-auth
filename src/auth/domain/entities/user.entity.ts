import { UserId } from 'src/shared/domain/types';
import { UserSnapshotType } from '../types/user-snapshot.type';
import { EmailVo, NameVo, PasswordVo } from 'src/shared/domain/value-objects';

interface CreateUserProps {
  id: UserId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export class User {
  private constructor(private readonly snap: UserSnapshotType) {}

  static create(props: CreateUserProps): User {
    const now = new Date();
    return new User({
      id: props.id,
      email: EmailVo.of(props.email),
      password: PasswordVo.of(props.password),
      firstName: NameVo.of(props.firstName),
      lastName: NameVo.of(props.lastName),
      createdAt: now,
      updatedAt: now,
    });
  }
  static reconstitute(snap: UserSnapshotType): User {
    return new User(snap);
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

  get verifiedAt() {
    return this.snap.verifiedAt;
  }

  get createdAt() {
    return this.snap.createdAt;
  }

  get updatedAt() {
    return this.snap.updatedAt;
  }

  isVerified(): boolean {
    return this.snap.verifiedAt !== null;
  }

  markAsVerified(): User {
    return new User({
      ...this.snap,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  equals(other: User): boolean {
    return other instanceof User && other.id === this.id;
  }
}
