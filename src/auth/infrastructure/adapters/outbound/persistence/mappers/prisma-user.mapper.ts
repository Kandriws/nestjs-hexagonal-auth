import { User as PrismaUser } from 'generated/prisma';
import { User } from 'src/auth/domain/entities/user.entity';
import { EmailVo, NameVo, PasswordVo } from 'src/shared/domain/value-objects';

export class PrismaUserMapper {
  static toDomain(raw: any): User {
    return User.reconstitute({
      id: raw.id,
      email: EmailVo.of(raw.email),
      password: PasswordVo.of(raw.password),
      firstName: NameVo.of(raw.firstName),
      lastName: NameVo.of(raw.lastName),
      verifiedAt: raw.verifiedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(user: User): PrismaUser {
    return {
      id: user.id,
      email: user.email.getValue(),
      password: user.password.getValue(),
      firstName: user.firstName.getValue(),
      lastName: user.lastName.getValue(),
      verifiedAt: user.verifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
