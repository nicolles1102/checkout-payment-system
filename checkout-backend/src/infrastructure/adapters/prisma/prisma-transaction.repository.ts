import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TransactionRepositoryPort } from '../../../domain/ports/transaction.repository.port';
import { Transaction, TransactionStatus } from '../../../domain/entities/transaction.entity';

@Injectable()
export class PrismaTransactionRepository implements TransactionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    amount: number;
    baseFee: number;
    deliveryFee: number;
    productId: string;
    customerId: string;
    deliveryId: string;
  }): Promise<Transaction> {
    const tx = await this.prisma.transactions.create({
      data: {
        amount: data.amount,
        base_fee: data.baseFee,
        delivery_fee: data.deliveryFee,
        product_id: data.productId,
        customer_id: data.customerId,
        delivery_id: data.deliveryId,
        status: 'PENDING',
      },
    });
    return new Transaction(
      tx.id,
      Number(tx.amount),
      Number(tx.base_fee),
      Number(tx.delivery_fee),
      tx.status as TransactionStatus,
      tx.wompi_transaction_id,
      tx.product_id,
      tx.customer_id,
      tx.delivery_id,
      tx.created_at,
    );
  }

  async findById(id: string): Promise<Transaction | null> {
    const tx = await this.prisma.transactions.findUnique({ where: { id } });
    if (!tx) return null;
    return new Transaction(
      tx.id,
      Number(tx.amount),
      Number(tx.base_fee),
      Number(tx.delivery_fee),
      tx.status as TransactionStatus,
      tx.wompi_transaction_id,
      tx.product_id,
      tx.customer_id,
      tx.delivery_id,
      tx.created_at,
    );
  }

  async updateStatus(id: string, status: TransactionStatus, wompiTransactionId?: string): Promise<void> {
    await this.prisma.transactions.update({
      where: { id },
      data: {
        status,
        wompi_transaction_id: wompiTransactionId,
      },
    });
  }
}