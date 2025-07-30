export enum TwoFactorMethod {
  TOTP = 'TOTP', // Time-based One-Time Password (e.g., Google Authenticator, Authy)
  EMAIL_OTP = 'EMAIL_OTP', // One-Time Password sent via Email
  SMS_OTP = 'SMS_OTP', // One-Time Password sent via SMS
}
