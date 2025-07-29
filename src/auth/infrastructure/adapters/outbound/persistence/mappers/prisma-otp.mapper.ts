import { Otp as PrismaOtp } from 'generated/prisma';
import { Otp } from 'src/auth/domain/entities';
import { OtpCodeVo } from 'src/auth/domain/value-objects/otp-code.vo';
import { UserId } from 'src/shared/domain/types';

export class PrismaOtpMapper {
  static toDomain(prismaOtpRecord: PrismaOtp): Otp {
    return Otp.create({
      id: prismaOtpRecord.id,
      userId: prismaOtpRecord.userId as UserId,
      code: OtpCodeVo.of(prismaOtpRecord.code),
      expiresAt: new Date(prismaOtpRecord.expiresAt),
    });
  }

  static toPersistence(otp: Otp): PrismaOtp {
    return {
      id: otp.id,
      userId: otp.userId,
      code: otp.code.getValue(),
      usedAt: otp.usedAt,
      createdAt: otp.createdAt,
      updatedAt: otp.updatedAt,
      expiresAt: otp.expiresAt,
    };
  }
}
