export class DateTimeVO {
  private constructor(private readonly value: Date) {}

  static of(value: Date | string): DateTimeVO {
    if (typeof value === 'string') {
      value = new Date(value);
    }
    if (!(value instanceof Date) || isNaN(value.getTime())) {
      throw new Error('Invalid date value');
    }

    return new DateTimeVO(value);
  }

  addDays(days: number): DateTimeVO {
    const newDate = new Date(this.value);
    newDate.setDate(newDate.getDate() + days);
    return new DateTimeVO(newDate);
  }

  addHours(hours: number): DateTimeVO {
    const newDate = new Date(this.value);
    newDate.setHours(newDate.getHours() + hours);
    return new DateTimeVO(newDate);
  }

  addMinutes(minutes: number): DateTimeVO {
    const newDate = new Date(this.value);
    newDate.setMinutes(newDate.getMinutes() + minutes);
    return new DateTimeVO(newDate);
  }

  getValue(): Date {
    return this.value;
  }

  equals(other: DateTimeVO): boolean {
    return this.value.getTime() === other.value.getTime();
  }

  isAfter(other: DateTimeVO): boolean {
    return this.value.getTime() > other.value.getTime();
  }

  isBefore(other: DateTimeVO): boolean {
    return this.value.getTime() < other.value.getTime();
  }

  isAfterOrEqual(other: DateTimeVO): boolean {
    return this.value.getTime() >= other.value.getTime();
  }

  isBeforeOrEqual(other: DateTimeVO): boolean {
    return this.value.getTime() <= other.value.getTime();
  }

  isBetween(
    start: DateTimeVO,
    end: DateTimeVO,
    inclusive: boolean = true,
  ): boolean {
    if (inclusive) {
      return this.isAfterOrEqual(start) && this.isBeforeOrEqual(end);
    }
    return this.isAfter(start) && this.isBefore(end);
  }

  getTime(): number {
    return this.value.getTime();
  }

  differenceInMinutes(other: DateTimeVO): number {
    const diffMs = Math.abs(this.value.getTime() - other.value.getTime());
    return Math.ceil(diffMs / 60_000);
  }

  secondsUntil(other: DateTimeVO): number {
    const diffMs = other.getTime() - this.getTime();
    return Math.ceil(diffMs / 1000);
  }

  static now(): DateTimeVO {
    return new DateTimeVO(new Date());
  }
}
