import { LockPolicy } from './interfaces/lock-policy.interface';
import { Threshold } from './interfaces/threshold.interface';

export class TableLockPolicy implements LockPolicy {
  constructor(private readonly thresholds: readonly Threshold[]) {}

  shouldLock(attempts: number): boolean {
    return this.thresholds.some((t) => attempts >= t.attempts);
  }

  lockDurationMinutes(attempts: number): number {
    const match = [...this.thresholds]
      .reverse()
      .find((t) => attempts >= t.attempts);
    return match ? match.lockMinutes : 0;
  }
}
