import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthStrategies } from 'src/auth/constants/auth-strategies.constant';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard(AuthStrategies.GOOGLE_OAUTH) {}
