import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthStrategies } from '../strategies/strategies.enum';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard(AuthStrategies.GOOGLE_OAUTH) {}
