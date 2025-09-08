import { User } from 'src/auth/domain/entities/user.entity';
import { UserResponseDto } from '../dtos/user-response.dto';

export class CreateUserMapper {
  static toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email.getValue(),
      firstName: user.firstName.getValue(),
      lastName: user.lastName.getValue(),
      verifiedAt: user.verifiedAt ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as UserResponseDto;
  }
}
