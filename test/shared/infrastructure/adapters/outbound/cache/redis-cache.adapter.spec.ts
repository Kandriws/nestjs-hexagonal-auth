const mockGet = jest.fn();
const mockSetex = jest.fn();
const mockSet = jest.fn();
const mockDel = jest.fn();
const mockExists = jest.fn();
const mockQuit = jest.fn();

jest.mock('ioredis', () => {
  const fn = jest.fn().mockImplementation(() => ({
    get: mockGet,
    setex: mockSetex,
    set: mockSet,
    del: mockDel,
    exists: mockExists,
    quit: mockQuit,
    on: jest.fn(),
  }));
  return { default: fn };
});

import { RedisCacheAdapter } from 'src/shared/infrastructure/adapters/outbound/cache/redis-cache.adapter';
import { CacheException } from 'src/shared/domain/exceptions/cache.exception';

describe('RedisCacheAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const conf = {
    ttlDefaultSeconds: 60,
    host: 'localhost',
    port: 6379,
    password: undefined,
    url: undefined,
  };

  it('get - returns parsed value when present', async () => {
    mockGet.mockResolvedValueOnce(JSON.stringify({ a: 1 }));

    const adapter = new RedisCacheAdapter(conf as any);
    const res = await adapter.get('key1');

    expect(res).toEqual({ a: 1 });
    expect(mockGet).toHaveBeenCalledWith('key1');
  });

  it('get - returns null when key missing', async () => {
    mockGet.mockResolvedValueOnce(null);

    const adapter = new RedisCacheAdapter(conf as any);
    const res = await adapter.get('nokey');

    expect(res).toBeNull();
  });

  it('set - uses setex when ttl > 0', async () => {
    const adapter = new RedisCacheAdapter(conf as any);
    await adapter.set('k', { v: 1 }, 10);

    expect(mockSetex).toHaveBeenCalledWith('k', 10, JSON.stringify({ v: 1 }));
    expect(mockSet).not.toHaveBeenCalled();
  });

  it('set - uses set when ttl <= 0', async () => {
    const adapter = new RedisCacheAdapter(conf as any);
    await adapter.set('k2', 'str', 0);

    expect(mockSet).toHaveBeenCalledWith('k2', JSON.stringify('str'));
    expect(mockSetex).not.toHaveBeenCalled();
  });

  it('delete - calls del', async () => {
    const adapter = new RedisCacheAdapter(conf as any);
    await adapter.delete('k3');

    expect(mockDel).toHaveBeenCalledWith('k3');
  });

  it('exists - returns true/false based on exists result', async () => {
    mockExists.mockResolvedValueOnce(1);
    const adapter = new RedisCacheAdapter(conf as any);
    const r1 = await adapter.exists('present');
    expect(r1).toBe(true);

    mockExists.mockResolvedValueOnce(0);
    const r2 = await adapter.exists('missing');
    expect(r2).toBe(false);
  });

  it('handles errors by throwing CacheException for get and exists', async () => {
    mockGet.mockRejectedValueOnce(new Error('boom'));
    mockExists.mockRejectedValueOnce(new Error('boom'));

    const adapter = new RedisCacheAdapter(conf as any);
    await expect(adapter.get('err')).rejects.toBeInstanceOf(CacheException);
    await expect(adapter.exists('err')).rejects.toBeInstanceOf(CacheException);
  });

  it('onModuleDestroy - calls quit', async () => {
    const adapter = new RedisCacheAdapter(conf as any);
    await adapter.onModuleDestroy();

    expect(mockQuit).toHaveBeenCalled();
  });
});
