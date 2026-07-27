import { CheckTransactionStatusUseCase } from './check-transaction-status.use-case';
import { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { WompiPort, WompiTransactionResult } from '../../domain/ports/wompi.port';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { Transaction, TransactionItem } from '../../domain/entities/transaction.entity';
import { Product } from '../../domain/entities/product.entity';

describe('CheckTransactionStatusUseCase', () => {
  let useCase: CheckTransactionStatusUseCase;
  let mockTransactionRepo: jest.Mocked<TransactionRepositoryPort>;
  let mockWompiPort: jest.Mocked<WompiPort>;
  let mockProductRepo: jest.Mocked<ProductRepositoryPort>;

  const baseTx = {
    id: 'tx-1',
    amount: 60000,
    baseFee: 3000,
    deliveryFee: 7000,
    productId: 'product-1',
    customerId: 'customer-1',
    deliveryId: 'delivery-1',
    items: [{ productId: 'product-1', quantity: 1, unitPrice: 50000 }] as TransactionItem[],
    createdAt: new Date(),
  };

  const mockProduct = Product.create({
    id: 'product-1',
    name: 'Chaquetita Oso',
    description: 'Para perritos',
    price: 50000,
    stock: 10,
    imageUrl: null,
    createdAt: new Date(),
  });

  function makeTransaction(
    status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR',
    wompiTxId: string | null,
  ): Transaction {
    return new Transaction(
      baseTx.id,
      baseTx.amount,
      baseTx.baseFee,
      baseTx.deliveryFee,
      status,
      wompiTxId,
      baseTx.productId,
      baseTx.customerId,
      baseTx.deliveryId,
      baseTx.items,
      baseTx.createdAt,
    );
  }

  beforeEach(() => {
    mockTransactionRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
    };

    mockWompiPort = {
      createTransaction: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    mockProductRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStock: jest.fn(),
      seedInitialProduct: jest.fn(),
    };

    useCase = new CheckTransactionStatusUseCase(
      mockTransactionRepo,
      mockWompiPort,
      mockProductRepo,
    );
  });

  describe('execute', () => {
    it('should return fail when transaction is not found', async () => {
      mockTransactionRepo.findById.mockResolvedValue(null);

      const result = await useCase.execute('nonexistent');

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toBe('Transaction not found');
    });

    it('should return existing status for APPROVED transactions without calling Wompi', async () => {
      const tx = makeTransaction('APPROVED', 'wompi-tx-1');
      mockTransactionRepo.findById.mockResolvedValue(tx);

      const result = await useCase.execute('tx-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value?.status).toBe('APPROVED');
      expect(mockWompiPort.getTransactionStatus).not.toHaveBeenCalled();
    });

    it('should return existing status for DECLINED transactions without calling Wompi', async () => {
      const tx = makeTransaction('DECLINED', 'wompi-tx-1');
      mockTransactionRepo.findById.mockResolvedValue(tx);

      const result = await useCase.execute('tx-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value?.status).toBe('DECLINED');
      expect(mockWompiPort.getTransactionStatus).not.toHaveBeenCalled();
    });

    it('should return existing status for ERROR transactions without calling Wompi', async () => {
      const tx = makeTransaction('ERROR', 'wompi-tx-1');
      mockTransactionRepo.findById.mockResolvedValue(tx);

      const result = await useCase.execute('tx-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value?.status).toBe('ERROR');
      expect(mockWompiPort.getTransactionStatus).not.toHaveBeenCalled();
    });

    it('should return PENDING when no wompiTransactionId exists', async () => {
      const tx = makeTransaction('PENDING', null);
      mockTransactionRepo.findById.mockResolvedValue(tx);

      const result = await useCase.execute('tx-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value?.status).toBe('PENDING');
      expect(mockWompiPort.getTransactionStatus).not.toHaveBeenCalled();
    });

    it('should query Wompi for PENDING transaction with wompiTransactionId', async () => {
      const tx = makeTransaction('PENDING', 'wompi-tx-1');
      mockTransactionRepo.findById.mockResolvedValue(tx);
      mockWompiPort.getTransactionStatus.mockResolvedValue({
        status: 'APPROVED',
        wompiTransactionId: 'wompi-tx-1',
      });

      const result = await useCase.execute('tx-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value?.status).toBe('APPROVED');
      expect(mockWompiPort.getTransactionStatus).toHaveBeenCalledWith('wompi-tx-1');
      expect(mockTransactionRepo.updateStatus).toHaveBeenCalledWith('tx-1', 'APPROVED');
    });

    it('should decrement stock when status changes from PENDING to APPROVED', async () => {
      const tx = makeTransaction('PENDING', 'wompi-tx-1');
      mockTransactionRepo.findById.mockResolvedValue(tx);
      mockWompiPort.getTransactionStatus.mockResolvedValue({
        status: 'APPROVED',
        wompiTransactionId: 'wompi-tx-1',
      });
      mockProductRepo.findById.mockResolvedValue(mockProduct);

      const result = await useCase.execute('tx-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value?.status).toBe('APPROVED');
      expect(mockProductRepo.findById).toHaveBeenCalledWith('product-1');
      expect(mockProductRepo.updateStock).toHaveBeenCalledWith('product-1', 9);
    });

    it('should not update status if Wompi returns same PENDING status', async () => {
      const tx = makeTransaction('PENDING', 'wompi-tx-1');
      mockTransactionRepo.findById.mockResolvedValue(tx);
      mockWompiPort.getTransactionStatus.mockResolvedValue({
        status: 'PENDING',
        wompiTransactionId: 'wompi-tx-1',
      });

      const result = await useCase.execute('tx-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value?.status).toBe('PENDING');
      expect(mockTransactionRepo.updateStatus).not.toHaveBeenCalled();
    });

    it('should handle Wompi API error gracefully', async () => {
      const tx = makeTransaction('PENDING', 'wompi-tx-1');
      mockTransactionRepo.findById.mockResolvedValue(tx);
      mockWompiPort.getTransactionStatus.mockRejectedValue(new Error('Wompi API down'));

      const result = await useCase.execute('tx-1');

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toBe('Wompi API down');
    });

    it('should return transaction details with correct structure', async () => {
      const tx = makeTransaction('APPROVED', 'wompi-tx-1');
      mockTransactionRepo.findById.mockResolvedValue(tx);

      const result = await useCase.execute('tx-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value?.transaction).toEqual({
        id: 'tx-1',
        amount: 60000,
        base_fee: 3000,
        delivery_fee: 7000,
        status: 'APPROVED',
        wompi_transaction_id: 'wompi-tx-1',
      });
    });
  });
});