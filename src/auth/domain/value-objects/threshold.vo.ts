export class Threshold {
  constructor(
    public readonly attempts: number,
    public readonly lockMinutes: number,
  ) {}
}
