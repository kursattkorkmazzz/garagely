import { TransactionManager } from "../../common/transaction-manager/transaction-manager";
import { db } from ".";

export class FirestoreTransactionManager implements TransactionManager<FirebaseFirestore.Transaction> {
  async run<T>(
    callback: (tx: FirebaseFirestore.Transaction) => Promise<T>,
  ): Promise<T> {
    return db.runTransaction(async (transaction) => {
      return callback(transaction);
    });
  }
}
