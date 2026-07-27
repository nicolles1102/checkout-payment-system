import { ConfigService } from '@nestjs/config';
import { WompiAdapter } from './wompi.adapter';

describe('WompiAdapter', () => {
  let adapter: WompiAdapter;
  let mockConfigService: jest.Mocked<ConfigService>;
  let originalFetch: typeof global.fetch;

  beforeAll(() => {
    originalFetch = global.fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'WOMPI_BASE_URL') return 'https://api-sandbox.co.uat.wompi.dev/v1';
        if (key === 'WOMPI_PRIVATE_KEY') return 'prv_test_key';
        if (key === 'WOMPI_INTEGRITY_KEY') return 'integrity_test_key';
        if (key === 'WOMPI_PUBLIC_KEY') return 'pub_test_key';
        return null;
      }),
    } as any;

    adapter = new WompiAdapter(mockConfigService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('createTransaction', () => {
    const validInput = {
      amountInCents: 6000000,
      currency: 'COP',
      reference: 'tx-ref-1',
      token: 'tok-test-123',
      acceptanceToken: 'acceptance-token-123',
      customerEmail: 'oso@email.com',
      customerFullName: 'Oso Pérez',
      customerPhoneNumber: '+573001234567',
    };

    it('should create a transaction and return APPROVED status', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: {
            id: 'wompi-tx-123',
            status: 'APPROVED',
          },
        }),
        text: async () => '',
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse as Response);

      const result = await adapter.createTransaction(validInput);

      expect(result.status).toBe('APPROVED');
      expect(result.wompiTransactionId).toBe('wompi-tx-123');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api-sandbox.co.uat.wompi.dev/v1/transactions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer prv_test_key',
          }),
        }),
      );
    });

    it('should return DECLINED status', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { id: 'wompi-tx-456', status: 'DECLINED' },
        }),
        text: async () => '',
      } as Response);

      const result = await adapter.createTransaction(validInput);

      expect(result.status).toBe('DECLINED');
    });

    it('should return PENDING status', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { id: 'wompi-tx-789', status: 'PENDING' },
        }),
        text: async () => '',
      } as Response);

      const result = await adapter.createTransaction(validInput);

      expect(result.status).toBe('PENDING');
    });

    it('should return ERROR when API call fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'Bad request',
      } as Response);

      const result = await adapter.createTransaction(validInput);

      expect(result.status).toBe('ERROR');
      expect(result.wompiTransactionId).toBe('');
    });

    it('should return ERROR when fetch throws', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await adapter.createTransaction(validInput);

      expect(result.status).toBe('ERROR');
      expect(result.wompiTransactionId).toBe('');
    });

    it('should return ERROR for unknown status', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { id: 'wompi-tx-999', status: 'VOIDED' },
        }),
        text: async () => '',
      } as Response);

      const result = await adapter.createTransaction(validInput);

      expect(result.status).toBe('ERROR');
    });
  });

  describe('getTransactionStatus', () => {
    it('should return APPROVED status for a completed transaction', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { id: 'wompi-tx-123', status: 'APPROVED' },
        }),
        text: async () => '',
      } as Response);

      const result = await adapter.getTransactionStatus('wompi-tx-123');

      expect(result.status).toBe('APPROVED');
      expect(result.wompiTransactionId).toBe('wompi-tx-123');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api-sandbox.co.uat.wompi.dev/v1/transactions/wompi-tx-123',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer prv_test_key',
          }),
        }),
      );
    });

    it('should return ERROR when transaction not found', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => 'Not found',
      } as Response);

      const result = await adapter.getTransactionStatus('nonexistent');

      expect(result.status).toBe('ERROR');
      expect(result.wompiTransactionId).toBe('nonexistent');
    });

    it('should return ERROR on network failure', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network timeout'));

      const result = await adapter.getTransactionStatus('wompi-tx-123');

      expect(result.status).toBe('ERROR');
      expect(result.wompiTransactionId).toBe('wompi-tx-123');
    });
  });
});