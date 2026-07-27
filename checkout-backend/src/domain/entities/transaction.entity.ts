export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

export interface TransactionItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly amount: number,
    public readonly baseFee: number,
    public readonly deliveryFee: number,
    public readonly status: TransactionStatus,
    public readonly wompiTransactionId: string | null,
    public readonly productId: string | null,
    public readonly customerId: string | null,
    public readonly deliveryId: string | null,
    public readonly items: TransactionItem[],
    public readonly createdAt: Date | null,
  ) {}
}