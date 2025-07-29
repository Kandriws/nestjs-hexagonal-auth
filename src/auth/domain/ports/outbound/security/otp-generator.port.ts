export const OtpGeneratorPort = Symbol('OtpGeneratorPort');
export interface OtpGeneratorPort {
  generate(): Promise<string>;
}
