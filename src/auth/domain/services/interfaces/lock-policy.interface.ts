export interface LockPolicy {
  shouldLock(attempts: number): boolean;
  lockDurationMinutes(attempts: number): number;
}
