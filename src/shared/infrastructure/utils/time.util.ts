/**
 * Converts a human-readable duration string ("15m", "2.5h", "7d")
 * into its equivalent in milliseconds.
 */
export function durationToMs(text: string): number {
  const [, numStr, unit] = text.match(/^(\d+(?:\.\d+)?)\s*([smhd])$/i) ?? [];
  if (!numStr || !unit) {
    throw new Error(`Invalid duration format: ${text}`);
  }

  const scale: Record<string, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return Number(numStr) * scale[unit.toLowerCase()];
}

/**
 * Returns a new Date resulting from adding the given duration
 * to the provided Date or epoch.
 * @param origin - The starting point, can be a Date or a timestamp.
 * @param durationText - The duration to add, in a human-readable format.
 *                       Example: "15m", "2.5h", "7d".
 * @returns A new Date object with the duration added.
 * @throws Error if the duration format is invalid.
 */
export function addDuration(origin: Date | number, durationText: string): Date {
  const offset = durationToMs(durationText);
  return new Date(
    (origin instanceof Date ? origin.getTime() : origin) + offset,
  );
}
