import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly redis: Redis;

  constructor() {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error('REDIS_URL não configurada');
    }

    this.redis = new Redis(redisUrl);
  }

  async onModuleInit() {
    await this.redis.ping();
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(
    key: string,
    value: string,
    ttl: number,
  ): Promise<'OK' | null> {
    return this.redis.set(key, value, 'EX', ttl);
  }

  async del(key: string): Promise<number> {
    return this.redis.del(key);
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}