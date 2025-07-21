import { User } from 'src/auth/domain/entities/user.entity';

export class PrismaUserMapper {
  static toDomain(raw: any): User {
    return User.create({
      id: raw.id,
      email: raw.email,
      password: raw.password,
      firstName: raw.firstName,
      lastName: raw.lastName,
    });
  }

  static toPersistence(user: User): any {
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
