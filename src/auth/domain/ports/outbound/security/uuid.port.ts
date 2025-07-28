export const UUIDPort = Symbol('UUIDPort');
export interface UUIDPort {
  generate(): string;
}
