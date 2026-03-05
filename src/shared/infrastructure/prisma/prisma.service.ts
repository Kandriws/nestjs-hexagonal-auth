import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { Prisma, PrismaClient } from '../../../../generated/prisma';
import { envs } from '../config/env.config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly transactionStorage =
    new AsyncLocalStorage<Prisma.TransactionClient>();

  constructor() {
    super({
      datasources: {
        db: {
          url: envs.database.url,
        },
      },
      log: envs.database.logQueries
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    });
  }

  async onModuleInit() {
    this.logger.log('Connecting to database...');
    await this.$connect();
    this.logger.log('Database connection established');
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }

  getClient(): Prisma.TransactionClient | PrismaClient {
    return this.transactionStorage.getStore() ?? this;
  }

  async runInTransaction<T>(operation: () => Promise<T>): Promise<T> {
    const activeTransaction = this.transactionStorage.getStore();

    if (activeTransaction) {
      return operation();
    }

    return this.$transaction((transactionClient) =>
      this.transactionStorage.run(transactionClient, operation),
    );
  }
}
