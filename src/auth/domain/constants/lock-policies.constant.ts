import { LoginThreshold } from '../services/interfaces/login-threshold.interface';

export const LOCK_POLICIES: Record<string, readonly LoginThreshold[]> = {
  standard: Object.freeze([
    { attempts: 5, lockMinutes: 5 },
    { attempts: 10, lockMinutes: 15 },
    { attempts: 15, lockMinutes: 30 },
  ]),
  aggressive: Object.freeze([
    { attempts: 3, lockMinutes: 15 },
    { attempts: 6, lockMinutes: 30 },
    { attempts: 10, lockMinutes: 60 },
    { attempts: 15, lockMinutes: 1440 },
  ]),
} as const;
