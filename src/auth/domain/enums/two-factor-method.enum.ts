export enum TwoFactorMethod {
  TOTP = 'totp', // Time-based One-Time Password (e.g., Google Authenticator, Authy)
  EMAIL_OTP = 'email_otp', // One-Time Password sent via Email
  SMS_OTP = 'sms_otp', // One-Time Password sent via SMS
}
