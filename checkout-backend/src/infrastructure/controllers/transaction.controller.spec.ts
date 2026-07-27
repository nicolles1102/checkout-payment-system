import { TransactionController } from './transaction.controller';
import { CreatePaymentUseCase } from '../../application/use-cases/create-payment.use-case';
import { CheckTransactionStatusUseCase } from '../../application/use-cases/check-transaction-status.use-case';
import { Result } from '../../application/common/result';

describe('TransactionController', () => {
  let controller: TransactionController;
  let mockCreatePaymentUseCase: jest.Mocked<CreatePaymentUseCase>;
  let mockCheckTransactionStatusUseCase: jest.Mocked<CheckTransactionStatusUseCase>;

  const validBody = {
    items: [{ productId: 'product-1', quantity: 1 }],
    email: 'oso@email.com',
    fullName: 'Oso Pérez',
    phoneNumber: '+573001234567',
    address: 'Calle 123',
    city: 'Medellín',
    region: 'Antioquia',
    postalCode: '050001',
    cardNumber: '4242424242424242',
    cvc: '123',
    expMonth: '12',
    expYear: '28',
    cardHolder: 'OSO PEREZ',
  };

  const successData = {
    transaction: {
      id: 'tx-1',
      amount: 60000,
      base_fee: 3000,
      delivery_fee: 7000,
      status: 'APPROVED',
      wompi_transaction_id: 'wompi-tx-1',
    },
    status: 'APPROVED',
  };

  beforeEach(() => {
    mockCreatePaymentUseCase = {
      execute: jest.fn(),
    } as any;

    mockCheckTransactionStatusUseCase = {
      execute: jest.fn(),
    } as any;

    controller = new TransactionController(
      mockCreatePaymentUseCase,
      mockCheckTransactionStatusUseCase,
    );
  });

  describe('createTransaction', () => {
    it('should create a transaction and return success', async () => {
      mockCreatePaymentUseCase.execute.mockResolvedValue(Result.ok(successData));

      const result = await controller.createTransaction(validBody);

      expect(result).toEqual({ success: true, data: successData });
      expect(mockCreatePaymentUseCase.execute).toHaveBeenCalledWith(validBody);
    });

    it('should return error when payment fails', async () => {
      mockCreatePaymentUseCase.execute.mockResolvedValue(
        Result.fail(new Error('Insufficient funds')),
      );

      const result = await controller.createTransaction(validBody);

      expect(result).toEqual({ success: false, error: 'Insufficient funds' });
    });

    it('should return generic error when no error message', async () => {
      mockCreatePaymentUseCase.execute.mockResolvedValue(
        Result.fail(new Error()),
      );

      const result = await controller.createTransaction(validBody);

      expect(result).toEqual({ success: false, error: 'Payment failed' });
    });
  });

  describe('getTransaction', () => {
    it('should return transaction by id', async () => {
      mockCheckTransactionStatusUseCase.execute.mockResolvedValue(Result.ok(successData));

      const result = await controller.getTransaction('tx-1');

      expect(result).toEqual({ success: true, data: successData });
      expect(mockCheckTransactionStatusUseCase.execute).toHaveBeenCalledWith('tx-1');
    });

    it('should return error when transaction is not found', async () => {
      mockCheckTransactionStatusUseCase.execute.mockResolvedValue(
        Result.fail(new Error('Transaction not found')),
      );

      const result = await controller.getTransaction('nonexistent');

      expect(result).toEqual({ success: false, error: 'Transaction not found' });
    });

    it('should return generic error when no error message', async () => {
      mockCheckTransactionStatusUseCase.execute.mockResolvedValue(
        Result.fail(new Error()),
      );

      const result = await controller.getTransaction('tx-1');

      expect(result).toEqual({ success: false, error: 'Transaction not found' });
    });
  });
});