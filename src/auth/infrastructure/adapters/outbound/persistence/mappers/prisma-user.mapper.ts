import { User as PrismaUser } from 'generated/prisma';
import { User } from 'src/auth/domain/entities/user.entity';
import { UserId } from 'src/shared/domain/types';
import { EmailVo, NameVo, PasswordVo } from 'src/shared/domain/value-objects';

export class PrismaUserMapper {
  static toDomain(prismaRecord: PrismaUser): User {
    return User.reconstitute({
      id: prismaRecord.id as UserId,
      email: EmailVo.of(prismaRecord.email),
      password: PasswordVo.of(prismaRecord.password),
      firstName: NameVo.of(prismaRecord.firstName),
      lastName: NameVo.of(prismaRecord.lastName),
      verifiedAt: prismaRecord.verifiedAt,
      createdAt: prismaRecord.createdAt,
      updatedAt: prismaRecord.updatedAt,
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
