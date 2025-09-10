export const CachePort = Symbol('CachePort');

export interface CachePort {
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}
