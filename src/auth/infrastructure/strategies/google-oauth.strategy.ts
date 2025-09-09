import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import googleOauthConfig from '../config/google-oauth.config';
import { ConfigType } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { AuthStrategies } from './strategies.enum';
import { SocialLoginEmailNotVerifiedException } from 'src/auth/domain/exceptions';

export class GoogleStrategy extends PassportStrategy(
  Strategy,
  AuthStrategies.GOOGLE_OAUTH,
) {
  constructor(
    @Inject(googleOauthConfig.KEY)
    googleConfig: ConfigType<typeof googleOauthConfig>,
  ) {
    super({
      clientID: googleConfig.clientId,
      clientSecret: googleConfig.clientSecret,
      callbackURL: googleConfig.callbackUrl,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const primaryEmail = profile?.emails?.[0]?.value;
      const emailVerified = profile?._json?.email_verified;
      if (!primaryEmail || !emailVerified) {
        return done(new SocialLoginEmailNotVerifiedException('google'), false);
      }
      const givenName =
        profile?.name?.givenName ||
        (profile.displayName || '').split(' ')[0] ||
        'User';
      const familyName =
        profile?.name?.familyName ||
        (profile.displayName || '').split(' ').slice(1).join(' ') ||
        'Google';

      return done(null, {
        profile: {
          id: profile.id,
          email: primaryEmail,
          firstName: givenName,
          lastName: familyName,
        },
      });
    } catch (err) {
      return done(err as any, false);
    }
  }
}
