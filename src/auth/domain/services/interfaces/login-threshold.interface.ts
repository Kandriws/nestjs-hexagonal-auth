export interface LoginThreshold {
  readonly attempts: number;
  readonly lockMinutes: number;
}
