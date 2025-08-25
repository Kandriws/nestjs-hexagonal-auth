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
  static toDomain(prismaOtpRecord: PrismaOtp): Otp {
    return Otp.reconstitute({
      id: prismaOtpRecord.id,
      userId: prismaOtpRecord.userId as UserId,
      code: OtpCodeVo.of(prismaOtpRecord.code),
      channel: this.channelMap[prismaOtpRecord.channel],
      purpose: this.purposeMap[prismaOtpRecord.purpose],
      usedAt: prismaOtpRecord.usedAt,
      revokedAt: prismaOtpRecord.revokedAt,
      expiresAt: new Date(prismaOtpRecord.expiresAt),
      createdAt: new Date(prismaOtpRecord.createdAt),
      updatedAt: new Date(prismaOtpRecord.updatedAt),
    });
  }

  static toPersistence(otp: Otp): PrismaOtp {
    return {
      id: otp.id,
      userId: otp.userId,
      code: otp.code.getValue(),
      channel: this.prismaOtpChannelMap[otp.channel],
      purpose: this.prismaOtpPurposeMap[otp.purpose],
      usedAt: otp.usedAt,
      revokedAt: otp.revokedAt,
      createdAt: otp.createdAt,
      updatedAt: otp.updatedAt,
      expiresAt: otp.expiresAt,
    };
  }

  private static readonly channelMap: Record<PrismaOtpChannel, OtpChannel> = {
    [PrismaOtpChannel.EMAIL]: OtpChannel.EMAIL,
    [PrismaOtpChannel.SMS]: OtpChannel.SMS,
  };

  private static readonly purposeMap: Record<PrismaOtpPurpose, OtpPurpose> = {
    [PrismaOtpPurpose.EMAIL_VERIFICATION]: OtpPurpose.EMAIL_VERIFICATION,
    [PrismaOtpPurpose.PASSWORD_RESET]: OtpPurpose.PASSWORD_RESET,
    [PrismaOtpPurpose.TWO_FACTOR_AUTHENTICATION]:
      OtpPurpose.TWO_FACTOR_AUTHENTICATION,
    [PrismaOtpPurpose.TWO_FACTOR_VERIFICATION]:
      OtpPurpose.TWO_FACTOR_VERIFICATION,
  };

  private static readonly prismaOtpChannelMap: Record<
    OtpChannel,
    PrismaOtpChannel
  > = {
    [OtpChannel.EMAIL]: PrismaOtpChannel.EMAIL,
    [OtpChannel.SMS]: PrismaOtpChannel.SMS,
  };

  private static readonly prismaOtpPurposeMap: Record<
    OtpPurpose,
    PrismaOtpPurpose
  > = {
    [OtpPurpose.EMAIL_VERIFICATION]: PrismaOtpPurpose.EMAIL_VERIFICATION,
    [OtpPurpose.PASSWORD_RESET]: PrismaOtpPurpose.PASSWORD_RESET,
    [OtpPurpose.TWO_FACTOR_AUTHENTICATION]:
      PrismaOtpPurpose.TWO_FACTOR_AUTHENTICATION,
    [OtpPurpose.TWO_FACTOR_VERIFICATION]:
      PrismaOtpPurpose.TWO_FACTOR_VERIFICATION,
  };

  static convertDomainPurposeToPrisma(purpose: OtpPurpose): PrismaOtpPurpose {
    return this.prismaOtpPurposeMap[purpose];
  }
}
