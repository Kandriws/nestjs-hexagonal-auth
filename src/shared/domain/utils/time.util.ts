export function minutesToMilliseconds(minutes: number): number {
  return minutes * 60 * 1000;
}

export function secondsToMilliseconds(seconds: number): number {
  return seconds * 1000;
}

export function millisecondsToSeconds(milliseconds: number): number {
  return milliseconds / 1000;
}

export function millisecondsToMinutes(milliseconds: number): number {
  return milliseconds / (1000 * 60);
}

export function millisecondsToHours(milliseconds: number): number {
  return milliseconds / (1000 * 60 * 60);
}
