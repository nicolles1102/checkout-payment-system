import { Transaction, TransactionStatus } from '../entities/transaction.entity';

export interface TransactionItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface TransactionRepositoryPort {
  create(data: {
    amount: number;
    baseFee: number;
    deliveryFee: number;
    productId: string;
    customerId: string;
    deliveryId: string;
    items: TransactionItemInput[];
  }): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  updateStatus(id: string, status: TransactionStatus, wompiTransactionId?: string): Promise<void>;
}
