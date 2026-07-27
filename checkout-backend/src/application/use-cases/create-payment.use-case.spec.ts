import { ConfigService } from '@nestjs/config';
import { CreatePaymentUseCase } from './create-payment.use-case';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { CustomerRepositoryPort } from '../../domain/ports/customer.repository.port';
import { DeliveryRepositoryPort } from '../../domain/ports/delivery.repository.port';
import { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { WompiPort, WompiTransactionResult } from '../../domain/ports/wompi.port';
import { Product } from '../../domain/entities/product.entity';
import { Customer } from '../../domain/entities/customer.entity';
import { Delivery } from '../../domain/entities/delivery.entity';
import { Transaction } from '../../domain/entities/transaction.entity';

describe('CreatePaymentUseCase', () => {
  let useCase: CreatePaymentUseCase;
  let mockProductRepo: jest.Mocked<ProductRepositoryPort>;
  let mockCustomerRepo: jest.Mocked<CustomerRepositoryPort>;
  let mockDeliveryRepo: jest.Mocked<DeliveryRepositoryPort>;
  let mockTransactionRepo: jest.Mocked<TransactionRepositoryPort>;
  let mockWompiPort: jest.Mocked<WompiPort>;
  let mockConfigService: jest.Mocked<ConfigService>;

  const mockProduct = Product.create({
    id: 'product-1',
    name: 'Chaquetita Oso',
    description: 'Para perritos',
    price: 50000,
    stock: 10,
    imageUrl: null,
    createdAt: new Date(),
  });

  const mockCustomer = new Customer(
    'customer-1',
    'oso@email.com',
    'Oso Pérez',
    '+573001234567',
    new Date(),
  );

  const mockDelivery = new Delivery(
    'delivery-1',
    'Calle 123',
    'Medellín',
    'Antioquia',
    '050001',
    'PENDING',
    new Date(),
  );

  const mockTransaction = new Transaction(
    'tx-1',
    60000,
    3000,
    7000,
    'APPROVED',
    'wompi-tx-1',
    'product-1',
    'customer-1',
    'delivery-1',
    [{ productId: 'product-1', quantity: 1, unitPrice: 50000 }],
    new Date(),
  );

  const defaultInput = {
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

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'WOMPI_PUBLIC_KEY') return 'pub_test_key';
        if (key === 'WOMPI_BASE_URL') return 'https://api-sandbox.co.uat.wompi.dev/v1';
        return null;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    mockProductRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStock: jest.fn(),
      seedInitialProduct: jest.fn(),
    };

    mockCustomerRepo = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    };

    mockDeliveryRepo = {
      create: jest.fn(),
    };

    mockTransactionRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
    };

    mockWompiPort = {
      createTransaction: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    useCase = new CreatePaymentUseCase(
      mockProductRepo,
      mockCustomerRepo,
      mockDeliveryRepo,
      mockTransactionRepo,
      mockWompiPort,
      mockConfigService,
    );
  });

  describe('execute', () => {
    const wompiApprovedResult: WompiTransactionResult = {
      status: 'APPROVED',
      wompiTransactionId: 'wompi-tx-1',
    };

    it('should process a payment successfully (APPROVED)', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct);
      mockCustomerRepo.findByEmail.mockResolvedValue(null);
      mockCustomerRepo.create.mockResolvedValue(mockCustomer);
      mockDeliveryRepo.create.mockResolvedValue(mockDelivery);
      mockTransactionRepo.create.mockResolvedValue(mockTransaction);
      mockWompiPort.createTransaction.mockResolvedValue(wompiApprovedResult);

      // Mock global fetch for acceptance token and card tokenization
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            presigned_acceptance: { acceptance_token: 'acceptance-token-123' },
          },
        }),
        text: async () => '',
      } as Response);

      const result = await useCase.execute(defaultInput);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.transaction.status).toBe('APPROVED');
      expect(result.value?.transaction.wompi_transaction_id).toBe('wompi-tx-1');
      expect(mockProductRepo.findById).toHaveBeenCalledWith('product-1');
      expect(mockCustomerRepo.findByEmail).toHaveBeenCalledWith('oso@email.com');
      expect(mockCustomerRepo.create).toHaveBeenCalledWith({
        email: 'oso@email.com',
        fullName: 'Oso Pérez',
        phoneNumber: '+573001234567',
      });
      expect(mockDeliveryRepo.create).toHaveBeenCalledWith({
        address: 'Calle 123',
        city: 'Medellín',
        region: 'Antioquia',
        postalCode: '050001',
      });
      expect(mockTransactionRepo.create).toHaveBeenCalled();
      expect(mockWompiPort.createTransaction).toHaveBeenCalled();
      // Stock should be decremented since payment was approved
      expect(mockProductRepo.updateStock).toHaveBeenCalledWith('product-1', 9);
    });

    it('should return fail when product is not found', async () => {
      mockProductRepo.findById.mockResolvedValue(null);

      const result = await useCase.execute(defaultInput);

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toBe('Product product-1 not found');
    });

    it('should return fail when product stock is insufficient', async () => {
      const lowStockProduct = Product.create({
        ...mockProduct,
        stock: 0,
      });
      mockProductRepo.findById.mockResolvedValue(lowStockProduct);

      const result = await useCase.execute(defaultInput);

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toContain('only has 0 units available');
    });

    it('should reuse existing customer if found by email', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct);
      mockCustomerRepo.findByEmail.mockResolvedValue(mockCustomer);
      mockDeliveryRepo.create.mockResolvedValue(mockDelivery);
      mockTransactionRepo.create.mockResolvedValue(mockTransaction);
      mockWompiPort.createTransaction.mockResolvedValue(wompiApprovedResult);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            presigned_acceptance: { acceptance_token: 'acceptance-token-123' },
          },
        }),
        text: async () => '',
      } as Response);

      const result = await useCase.execute(defaultInput);

      expect(result.isSuccess).toBe(true);
      expect(mockCustomerRepo.findByEmail).toHaveBeenCalledWith('oso@email.com');
      expect(mockCustomerRepo.create).not.toHaveBeenCalledWith(
        expect.objectContaining({ email: 'oso@email.com' }),
      );
    });

    it('should handle DECLINED payment from Wompi', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct);
      mockCustomerRepo.findByEmail.mockResolvedValue(mockCustomer);
      mockDeliveryRepo.create.mockResolvedValue(mockDelivery);
      mockTransactionRepo.create.mockResolvedValue(mockTransaction);
      mockWompiPort.createTransaction.mockResolvedValue({
        status: 'DECLINED',
        wompiTransactionId: 'wompi-tx-declined',
      });
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            presigned_acceptance: { acceptance_token: 'acceptance-token-123' },
          },
        }),
        text: async () => '',
      } as Response);

      const result = await useCase.execute(defaultInput);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.transaction.status).toBe('DECLINED');
      // Stock should NOT be decremented if declined
      expect(mockProductRepo.updateStock).not.toHaveBeenCalled();
    });

    it('should handle PENDING payment from Wompi (async)', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct);
      mockCustomerRepo.findByEmail.mockResolvedValue(mockCustomer);
      mockDeliveryRepo.create.mockResolvedValue(mockDelivery);
      mockTransactionRepo.create.mockResolvedValue(mockTransaction);
      mockWompiPort.createTransaction.mockResolvedValue({
        status: 'PENDING',
        wompiTransactionId: 'wompi-tx-pending',
      });
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            presigned_acceptance: { acceptance_token: 'acceptance-token-123' },
          },
        }),
        text: async () => '',
      } as Response);

      const result = await useCase.execute(defaultInput);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.transaction.status).toBe('PENDING');
      // Stock should NOT be decremented if pending
      expect(mockProductRepo.updateStock).not.toHaveBeenCalled();
    });

    it('should handle Wompi API errors', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct);
      mockCustomerRepo.findByEmail.mockResolvedValue(mockCustomer);
      mockDeliveryRepo.create.mockResolvedValue(mockDelivery);
      mockTransactionRepo.create.mockResolvedValue(mockTransaction);
      mockWompiPort.createTransaction.mockResolvedValue({
        status: 'ERROR',
        wompiTransactionId: '',
      });
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            presigned_acceptance: { acceptance_token: 'acceptance-token-123' },
          },
        }),
        text: async () => '',
      } as Response);

      const result = await useCase.execute(defaultInput);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.transaction.status).toBe('ERROR');
    });

    it('should handle tokenization failure gracefully', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct);
      mockCustomerRepo.findByEmail.mockResolvedValue(mockCustomer);
      mockDeliveryRepo.create.mockResolvedValue(mockDelivery);
      mockTransactionRepo.create.mockResolvedValue(mockTransaction);

      // First fetch (acceptance token) succeeds, second fetch (tokenization) fails
      let fetchCallCount = 0;
      global.fetch = jest.fn().mockImplementation(async () => {
        fetchCallCount++;
        if (fetchCallCount === 1) {
          return {
            ok: true,
            json: async () => ({
              data: {
                presigned_acceptance: { acceptance_token: 'acceptance-token-123' },
              },
            }),
            text: async () => '',
          } as Response;
        }
        // tokenization fails
        throw new Error('Tokenization service unavailable');
      });

      const result = await useCase.execute(defaultInput);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should calculate total correctly with base fee and delivery fee', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct);
      mockCustomerRepo.findByEmail.mockResolvedValue(mockCustomer);
      mockDeliveryRepo.create.mockResolvedValue(mockDelivery);
      mockTransactionRepo.create.mockResolvedValue(mockTransaction);
      mockWompiPort.createTransaction.mockResolvedValue(wompiApprovedResult);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            presigned_acceptance: { acceptance_token: 'acceptance-token-123' },
          },
        }),
        text: async () => '',
      } as Response);

      const result = await useCase.execute(defaultInput);
      const expectedTotal = 50000 + 3000 + 7000; // subtotal + base fee + delivery fee

      expect(result.isSuccess).toBe(true);
      expect(result.value?.transaction.amount).toBe(expectedTotal);
    });
  });
});