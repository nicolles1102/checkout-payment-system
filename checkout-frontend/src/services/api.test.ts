/**
 * @jest-environment jsdom
 */

// Mock fetch globally for testing the real api.ts implementation
const mockFetch = jest.fn();
globalThis.fetch = mockFetch as unknown as typeof fetch;

// Do NOT mock './api' - we want to test the real implementation
import { api } from './api';
import type { CreateTransactionPayload } from '../types';

const API_BASE = 'http://localhost:3000';

const mockProducts = [
  {
    id: '1',
    name: 'Chaquetita Oso',
    description: 'Para perritos',
    price: 50000,
    stock: 10,
    imageUrl: null,
    created_at: '2024-01-01T00:00:00Z',
  },
];

const mockTransactionResponse = {
  success: true,
  data: {
    transaction: {
      id: 'tx-1',
      amount: 60000,
      base_fee: 3000,
      delivery_fee: 7000,
      status: 'APPROVED' as const,
      wompi_transaction_id: 'wompi-tx-1',
    },
    status: 'APPROVED' as const,
  },
};

const mockWompiResponse = {
  data: {
    presigned_acceptance: {
      acceptance_token: 'acceptance-token-123',
    },
  },
};

describe('api service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should fetch products successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: mockProducts }),
      });

      const products = await api.getProducts();
      expect(products).toEqual(mockProducts);
      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/products`, {
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should throw error when request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ success: false, error: 'Server error' }),
      });

      await expect(api.getProducts()).rejects.toThrow('Server error');
    });

    it('should return empty array when no products available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: [] }),
      });

      const products = await api.getProducts();
      expect(products).toEqual([]);
    });
  });

  describe('getProduct', () => {
    it('should fetch a single product by id', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: mockProducts[0] }),
      });

      const product = await api.getProduct('1');
      expect(product).toEqual(mockProducts[0]);
      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/products/1`, {
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should throw error when product not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ success: false, error: 'Product not found' }),
      });

      await expect(api.getProduct('nonexistent')).rejects.toThrow('Product not found');
    });
  });

  describe('createTransaction', () => {
    const payload: CreateTransactionPayload = {
      items: [{ productId: '1', quantity: 1 }],
      customer: { email: 'oso@email.com', full_name: 'Oso Pérez', phone_number: '+57' },
      delivery: { address: 'Calle 123', city: 'Medellín', region: 'Antioquia', postal_code: '050001' },
      card: { number: '4242', cvc: '123', exp_month: '12', exp_year: '28', card_holder: 'OSO PEREZ' },
      accept_terms: true,
    };

    it('should create a transaction successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockTransactionResponse,
      });

      const result = await api.createTransaction(payload);
      expect(result).toEqual(mockTransactionResponse.data);
      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: payload.items,
          email: payload.customer.email,
          fullName: payload.customer.full_name,
          phoneNumber: payload.customer.phone_number,
          address: payload.delivery.address,
          city: payload.delivery.city,
          region: payload.delivery.region,
          postalCode: payload.delivery.postal_code,
          cardNumber: payload.card.number,
          cvc: payload.card.cvc,
          expMonth: payload.card.exp_month,
          expYear: payload.card.exp_year,
          cardHolder: payload.card.card_holder,
        }),
      });
    });

    it('should throw error when payment fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ success: false, error: 'Insufficient funds' }),
      });

      await expect(api.createTransaction(payload)).rejects.toThrow('Insufficient funds');
    });
  });

  describe('getTransaction', () => {
    it('should get transaction by id', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockTransactionResponse,
      });

      const result = await api.getTransaction('tx-1');
      expect(result).toEqual(mockTransactionResponse.data);
      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/transactions/tx-1`, {
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should throw error when transaction not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ success: false, error: 'Transaction not found' }),
      });

      await expect(api.getTransaction('nonexistent')).rejects.toThrow('Transaction not found');
    });
  });

  describe('getWompiAcceptanceToken', () => {
    it('should return acceptance token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockWompiResponse,
      });

      const token = await api.getWompiAcceptanceToken();
      expect(token).toBe('acceptance-token-123');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api-sandbox.co.uat.wompi.dev/v1/merchants/pub_test_key'
      );
    });

    it('should return empty string when base URL is not set', async () => {
      // Save original env
      const origEnv = (globalThis as Record<string, unknown>).__ENV__;
      // Set empty base URL (the api reads from globalThis.__ENV__ at call time)
      (globalThis as Record<string, unknown>).__ENV__ = {
        ...origEnv as Record<string, string>,
        VITE_WOMPI_BASE_URL: '',
      };

      const token = await api.getWompiAcceptanceToken();
      expect(token).toBe('');

      // Restore original env
      (globalThis as Record<string, unknown>).__ENV__ = origEnv;
    });
  });
});