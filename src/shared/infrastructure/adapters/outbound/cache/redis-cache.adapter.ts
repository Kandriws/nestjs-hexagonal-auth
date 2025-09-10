import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { CachePort } from 'src/shared/domain/ports/outbound/cache/cache.port';
import { CacheException } from 'src/shared/domain/exceptions';
import cacheConfig from 'src/shared/infrastructure/config/cache.config';

@Injectable()
export class RedisCacheAdapter implements CachePort, OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisCacheAdapter.name);
  private readonly defaultTtl: number;

  constructor(
    @Inject(cacheConfig.KEY)
    private readonly cacheConf: ReturnType<typeof cacheConfig>,
  ) {
    this.defaultTtl = this.cacheConf.ttlDefaultSeconds;
    if (this.cacheConf.url) {
      this.client = new Redis(this.cacheConf.url);
    } else {
      this.client = new Redis({
        host: this.cacheConf.host,
        port: this.cacheConf.port,
        password: this.cacheConf.password,
      });
    }

    this.client.on('error', (err) =>
      this.logger.error('Redis connection error', err),
    );

    this.client.on('connect', () => this.logger.log('Connected to Redis'));
    this.client.on('ready', () => this.logger.log('Redis client ready'));
    this.client.on('close', () => this.logger.log('Redis connection closed'));
    this.client.on('reconnecting', () =>
      this.logger.log('Reconnecting to Redis...'),
    );
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const raw = await this.client.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (e) {
      this.logger.error(`get(${key})`, e);
      throw new CacheException();
    }
  }

  async set<T = any>(
    key: string,
    value: T,
    ttlSeconds?: number,
  ): Promise<void> {
    try {
      const ttl = ttlSeconds ?? this.defaultTtl;
      const serialized = JSON.stringify(value);

      if (ttl > 0) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (e) {
      this.logger.error(`set(${key})`, e);
      throw new CacheException();
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (e) {
      this.logger.error(`delete(${key})`, e);
      throw new CacheException();
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      return (await this.client.exists(key)) === 1;
    } catch (e) {
      this.logger.error(`exists(${key})`, e);
      throw new CacheException();
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
