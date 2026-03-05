export const TransactionManagerPort = Symbol('TransactionManagerPort');

export interface TransactionManagerPort {
  runInTransaction<T>(operation: () => Promise<T>): Promise<T>;
}
