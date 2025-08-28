import { DateTimeVO } from 'src/shared/domain/value-objects';
import { Threshold } from '../value-objects/threshold.vo';

/**
 * Represents a rate-limiting window for login attempts.
 *
 * This entity encapsulates the state and rules to count attempts,
 * determine the applicable threshold, and mark (lock) the window when the
 * configured threshold is reached.
 *
 * Responsibilities:
 * - Maintain the number of attempts within the current window.
 * - Determine the current threshold based on the provided thresholds list.
 * - Mark (lock) the window when the threshold is reached.
 *
 * Note: This class performs no I/O or persistence; it only models domain
 * behavior. Therefore it is implemented as a domain entity.
 */
export class RateLimitWindow {
  private readonly _thresholds: readonly Threshold[];
  private readonly _now: DateTimeVO;
  private _attempts: number;
  private _windowStart: DateTimeVO;
  private _windowEnd: DateTimeVO;

  constructor(
    thresholds: readonly Threshold[],
    now: DateTimeVO,
    attempts: number = 0,
    windowStart: DateTimeVO,
    windowEnd: DateTimeVO,
  ) {
    this._thresholds = thresholds;
    this._now = now;
    this._attempts = attempts;
    this._windowStart = windowStart;
    this._windowEnd = windowEnd;
  }

  // --- Public read-only properties (API) ---------------------------------
  /** Number of attempts recorded in this window. */
  get attempts(): number {
    return this._attempts;
  }

  /** Window start date/time. */
  get windowStart(): DateTimeVO {
    return this._windowStart;
  }

  /** Window end date/time. */
  get windowEnd(): DateTimeVO {
    return this._windowEnd;
  }

  /**
   * Current applicable threshold according to the attempts count.
   * Returns the Threshold corresponding to the configured policies.
   */
  get currentThreshold(): Threshold {
    return this._thresholds[this.getThresholdIndex()];
  }

  // --- Public behavior --------------------------------------------------
  /** Returns remaining attempts until the current threshold is reached. */
  remainingAttempts(): number {
    const remaining = this.currentThreshold.attempts - this._attempts;
    return remaining < 0 ? 0 : remaining;
  }

  /**
   * Indicates whether the window is active relative to the current instant
   * (`now`). Uses `isBetween(..., false)` to treat the end boundary as
   * exclusive.
   */
  isWindowActive(): boolean {
    return this._now.isBetween(this._windowStart, this._windowEnd, false);
  }

  /**
   * Register an attempt and lock the window if the limit is reached.
   * If the current window is active, no new attempts will be recorded and
   * the method returns early.
   */
  registerAttemptAndBlockIfLimitReached(): void {
    if (this.isWindowActive()) return;
    this.incrementAttempts();
    this.checkAndBlockIfRateLimitReached();
  }

  /**
   * Check current attempts and block the window if the threshold is reached.
   * This method does NOT modify attempts and is safe to call after an
   * external, atomic increment has already been applied at the persistence
   * layer. It exists to support concurrency-safe adapters which perform
   * an atomic increment in the DB and then need domain logic to decide if
   * the window should be blocked.
   */
  blockIfNeeded(): void {
    if (this.isWindowActive()) return;
    this.checkAndBlockIfRateLimitReached();
  }

  // --- Private helpers --------------------------------------------------
  /** Increment the attempts counter by 1. */
  private incrementAttempts(): void {
    this._attempts += 1;
  }

  /**
   * Checks whether the threshold has been reached and, if so, locks the
   * window. Uses strict equality to detect the exact moment the configured
   * attempts count is reached.
   */
  private checkAndBlockIfRateLimitReached(): void {
    // If attempts are equal or exceed the current threshold, block the window.
    // This covers the case where attempts exceed the highest configured
    // threshold — we should still apply the highest threshold's lock.
    const thresholdAttempts = this.currentThreshold.attempts;
    if (this._attempts >= thresholdAttempts) {
      this.blockWindow();
    }
  }

  /**
   * Lock the window by setting start = now and end = now + lockMinutes
   * based on the current threshold.
   */
  private blockWindow(): void {
    this._windowStart = this._now;
    this._windowEnd = this._now.addMinutes(this.currentThreshold.lockMinutes);
  }

  private getThresholdIndex(): number {
    const index = this._thresholds.findIndex(
      (t) => this._attempts <= t.attempts,
    );
    return index === -1 ? this._thresholds.length - 1 : index;
  }
}
