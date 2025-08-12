import { SendOtpCommand } from '../commands/send-otp.command';

export const OtpSenderPort = Symbol('OtpSenderPort');
export interface OtpSenderPort {
  /**
   * Sends an OTP to the user.
   * @param command - The command containing user details and OTP information.
   * @param command.userId - The ID of the user to whom the OTP is sent.
   * @param command.contact - The contact method (e.g., email or phone) to which the OTP is sent.
   * @param command.purpose - The purpose of the OTP (e.g., login, registration).
   * @param command.channel - The channel through which the OTP is sent (e.g., email, SMS).
   * @returns A promise that resolves when the OTP is sent successfully.
   * @throws {OtpRateLimitExceededException} If the OTP rate limit is exceeded.
   */
  sendOtp(command: SendOtpCommand): Promise<void>;
}
