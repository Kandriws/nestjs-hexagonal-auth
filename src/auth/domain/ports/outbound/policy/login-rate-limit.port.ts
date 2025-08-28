import { RateLimitInfo } from 'src/auth/domain/types/rate-limit-info.type';

export const LoginRateLimitPort = Symbol('LoginRateLimitPort');
export interface LoginRateLimitPort {
  hit(userId: string): Promise<RateLimitInfo>;
  reset(userId: string): Promise<void>;
}
