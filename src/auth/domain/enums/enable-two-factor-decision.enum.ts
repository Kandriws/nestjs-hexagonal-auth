export enum EnableTwoFactorDecisionType {
  SEND_OTP = 'SEND_OTP',
  GENERATE_TOTP = 'GENERATE_TOTP',
  GENERATE_OTP = 'GENERATE_OTP',
  ALREADY_ENABLED = 'ALREADY_ENABLED',
}

export type EnableTwoFactorDecision =
  | { type: EnableTwoFactorDecisionType.SEND_OTP }
  | { type: EnableTwoFactorDecisionType.GENERATE_TOTP }
  | { type: EnableTwoFactorDecisionType.ALREADY_ENABLED }
  | { type: EnableTwoFactorDecisionType.GENERATE_OTP };

export default EnableTwoFactorDecisionType;
