import {
  OtpChannel as PrismaOtpChannel,
  OtpPurpose as PrismaOtpPurpose,
  Otp as PrismaOtp,
} from 'generated/prisma';
import { Otp } from 'src/auth/domain/entities';
import { OtpChannel, OtpPurpose } from 'src/auth/domain/enums';
import { OtpCodeVo } from 'src/auth/domain/value-objects/otp-code.vo';
import { UserId } from 'src/shared/domain/types';

export class PrismaOtpMapper {
  private static readonly channelMap: Record<PrismaOtpChannel, OtpChannel> = {
    [PrismaOtpChannel.EMAIL]: OtpChannel.EMAIL,
    [PrismaOtpChannel.SMS]: OtpChannel.SMS,
  };

  private static readonly purposeMap: Record<PrismaOtpPurpose, OtpPurpose> = {
    [PrismaOtpPurpose.EMAIL_VERIFICATION]: OtpPurpose.EMAIL_VERIFICATION,
    [PrismaOtpPurpose.PASSWORD_RESET]: OtpPurpose.PASSWORD_RESET,
    [PrismaOtpPurpose.TWO_FACTOR_AUTHENTICATION]:
      OtpPurpose.TWO_FACTOR_AUTHENTICATION,
  };

  static toDomain(prismaOtpRecord: PrismaOtp): Otp {
    return Otp.reconstitute({
      id: prismaOtpRecord.id,
      userId: prismaOtpRecord.userId as UserId,
      code: OtpCodeVo.of(prismaOtpRecord.code),
      channel: this.channelMap[prismaOtpRecord.channel],
      purpose: this.purposeMap[prismaOtpRecord.purpose],
      usedAt: prismaOtpRecord.usedAt,
      expiresAt: new Date(prismaOtpRecord.expiresAt),
      createdAt: new Date(prismaOtpRecord.createdAt),
      updatedAt: new Date(prismaOtpRecord.updatedAt),
    });
  }

  // TODO:: Check the mapper for the correct conversion from domain to Prisma model
  static toPersistence(otp: Otp): PrismaOtp {
    return {
      id: otp.id,
      userId: otp.userId,
      code: otp.code.getValue(),
      channel: PrismaOtpChannel[otp.channel],
      purpose: PrismaOtpPurpose[otp.purpose],
      usedAt: otp.usedAt,
      createdAt: otp.createdAt,
      updatedAt: otp.updatedAt,
      expiresAt: otp.expiresAt,
    };
  }
}
