import { WompiPort } from '../../domain/ports/wompi.port';
import { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { Result } from '../common/result';

export class CheckTransactionStatusUseCase {
  constructor(
    private readonly transactionRepo: TransactionRepositoryPort,
    private readonly wompiPort: WompiPort,
  ) {}

  async execute(transactionId: string): Promise<Result<{
    transaction: {
      id: string;
      amount: number;
      base_fee: number;
      delivery_fee: number;
      status: string;
      wompi_transaction_id: string | null;
    };
    status: string;
  }, Error>> {
    try {
      const transaction = await this.transactionRepo.findById(transactionId);
      if (!transaction) {
        return Result.fail(new Error('Transaction not found'));
      }

      // If transaction is already in a final state (APPROVED/DECLINED/ERROR), return as-is
      if (transaction.status === 'APPROVED' || transaction.status === 'DECLINED' || transaction.status === 'ERROR') {
        return Result.ok({
          transaction: {
            id: transaction.id,
            amount: transaction.amount,
            base_fee: transaction.baseFee,
            delivery_fee: transaction.deliveryFee,
            status: transaction.status,
            wompi_transaction_id: transaction.wompiTransactionId,
          },
          status: transaction.status,
        });
      }

      // Transaction is PENDING — ask Wompi for the actual status
      if (!transaction.wompiTransactionId) {
        return Result.ok({
          transaction: {
            id: transaction.id,
            amount: transaction.amount,
            base_fee: transaction.baseFee,
            delivery_fee: transaction.deliveryFee,
            status: 'PENDING',
            wompi_transaction_id: null,
          },
          status: 'PENDING',
        });
      }

      const wompiResult = await this.wompiPort.getTransactionStatus(transaction.wompiTransactionId);

      // If Wompi returned a different status, update our local DB
      const status = wompiResult.status;
      if (status !== 'PENDING') {
        await this.transactionRepo.updateStatus(transaction.id, status);
      }

      return Result.ok({
        transaction: {
          id: transaction.id,
          amount: transaction.amount,
          base_fee: transaction.baseFee,
          delivery_fee: transaction.deliveryFee,
          status,
          wompi_transaction_id: transaction.wompiTransactionId,
        },
        status,
      });
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Failed to check transaction status'));
    }
  }
}