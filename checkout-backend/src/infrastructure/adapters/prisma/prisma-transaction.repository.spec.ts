import { PrismaTransactionRepository } from './prisma-transaction.repository';
import { Transaction } from '../../../domain/entities/transaction.entity';

describe('PrismaTransactionRepository', () => {
  let repository: PrismaTransactionRepository;
  let mockPrisma: any;

  const mockTxRecord = {
    id: 'tx-1',
    amount: 60000,
    base_fee: 3000,
    delivery_fee: 7000,
    status: 'PENDING',
    wompi_transaction_id: null,
    product_id: 'prod-1',
    customer_id: 'cust-1',
    delivery_id: 'del-1',
    transaction_items: [
      {
        product_id: 'prod-1',
        quantity: 1,
        unit_price: 50000,
      },
    ],
    created_at: new Date(),
  };

  const mockTxRecordWithItems = {
    ...mockTxRecord,
    transaction_items: [
      {
        product_id: 'prod-1',
        quantity: 1,
        unit_price: 50000,
      },
      {
        product_id: 'prod-2',
        quantity: 2,
        unit_price: 25000,
      },
    ],
  };

  beforeEach(() => {
    mockPrisma = {
      transactions: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    repository = new PrismaTransactionRepository(mockPrisma);
  });

  describe('create', () => {
    it('should create a transaction with items and return domain entity', async () => {
      mockPrisma.transactions.create.mockResolvedValue(mockTxRecord);

      const result = await repository.create({
        amount: 60000,
        baseFee: 3000,
        deliveryFee: 7000,
        productId: 'prod-1',
        customerId: 'cust-1',
        deliveryId: 'del-1',
        items: [{ productId: 'prod-1', quantity: 1, unitPrice: 50000 }],
      });

      expect(result).toBeInstanceOf(Transaction);
      expect(result.id).toBe('tx-1');
      expect(result.amount).toBe(60000);
      expect(result.baseFee).toBe(3000);
      expect(result.deliveryFee).toBe(7000);
      expect(result.status).toBe('PENDING');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe('prod-1');
      expect(result.items[0].quantity).toBe(1);
      expect(result.items[0].unitPrice).toBe(50000);
      expect(mockPrisma.transactions.create).toHaveBeenCalledWith({
        data: {
          amount: 60000,
          base_fee: 3000,
          delivery_fee: 7000,
          product_id: 'prod-1',
          customer_id: 'cust-1',
          delivery_id: 'del-1',
          status: 'PENDING',
          transaction_items: {
            create: [
              {
                product_id: 'prod-1',
                quantity: 1,
                unit_price: 50000,
              },
            ],
          },
        },
        include: {
          transaction_items: true,
        },
      });
    });

    it('should create transaction with multiple items', async () => {
      mockPrisma.transactions.create.mockResolvedValue(mockTxRecordWithItems);

      const result = await repository.create({
        amount: 100000,
        baseFee: 3000,
        deliveryFee: 7000,
        productId: 'prod-1',
        customerId: 'cust-1',
        deliveryId: 'del-1',
        items: [
          { productId: 'prod-1', quantity: 1, unitPrice: 50000 },
          { productId: 'prod-2', quantity: 2, unitPrice: 25000 },
        ],
      });

      expect(result.items).toHaveLength(2);
      expect(result.items[1].productId).toBe('prod-2');
      expect(result.items[1].quantity).toBe(2);
      expect(result.items[1].unitPrice).toBe(25000);
    });
  });

  describe('findById', () => {
    it('should return transaction with items when found', async () => {
      mockPrisma.transactions.findUnique.mockResolvedValue(mockTxRecord);

      const result = await repository.findById('tx-1');

      expect(result).toBeInstanceOf(Transaction);
      expect(result?.id).toBe('tx-1');
      expect(result?.items).toHaveLength(1);
      expect(mockPrisma.transactions.findUnique).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
        include: {
          transaction_items: true,
        },
      });
    });

    it('should return null when transaction not found', async () => {
      mockPrisma.transactions.findUnique.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle transaction with wompi_transaction_id', async () => {
      const approvedRecord = {
        ...mockTxRecord,
        status: 'APPROVED',
        wompi_transaction_id: 'wompi-tx-123',
      };
      mockPrisma.transactions.findUnique.mockResolvedValue(approvedRecord);

      const result = await repository.findById('tx-1');

      expect(result?.status).toBe('APPROVED');
      expect(result?.wompiTransactionId).toBe('wompi-tx-123');
    });
  });

  describe('updateStatus', () => {
    it('should update transaction status', async () => {
      mockPrisma.transactions.update.mockResolvedValue({});

      await repository.updateStatus('tx-1', 'APPROVED');

      expect(mockPrisma.transactions.update).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
        data: {
          status: 'APPROVED',
          wompi_transaction_id: undefined,
        },
      });
    });

    it('should update status with wompi transaction id', async () => {
      mockPrisma.transactions.update.mockResolvedValue({});

      await repository.updateStatus('tx-1', 'APPROVED', 'wompi-tx-123');

      expect(mockPrisma.transactions.update).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
        data: {
          status: 'APPROVED',
          wompi_transaction_id: 'wompi-tx-123',
        },
      });
    });
  });

  describe('toDomain (mapping)', () => {
    it('should handle empty transaction_items', async () => {
      const recordWithoutItems = {
        ...mockTxRecord,
        transaction_items: null,
      };
      mockPrisma.transactions.findUnique.mockResolvedValue(recordWithoutItems);

      const result = await repository.findById('tx-1');

      expect(result?.items).toEqual([]);
    });

    it('should convert Decimal amounts to numbers', async () => {
      const recordWithDecimals = {
        ...mockTxRecord,
        amount: 60000.50,
        base_fee: 3000.75,
        delivery_fee: 7000.25,
        transaction_items: [{
          product_id: 'prod-1',
          quantity: 1,
          unit_price: 50000.99,
        }],
      };
      mockPrisma.transactions.findUnique.mockResolvedValue(recordWithDecimals);

      const result = await repository.findById('tx-1');

      expect(result?.amount).toBe(60000.50);
      expect(result?.baseFee).toBe(3000.75);
      expect(result?.deliveryFee).toBe(7000.25);
      expect(result?.items[0].unitPrice).toBe(50000.99);
    });
  });
});