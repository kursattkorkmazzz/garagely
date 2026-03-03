export interface TransactionManager<TTransaction> {
  run<T>(callback: (tx: TTransaction) => Promise<T>): Promise<T>;
}
