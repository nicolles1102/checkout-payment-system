jest.mock('../services/api', () => ({
  api: {
    createTransaction: jest.fn(),
    getTransaction: jest.fn(),
  },
}));

import transactionReducer, {
  createTransaction,
  checkTransactionStatus,
  pollTransactionStatus,
  resetTransaction,
} from './transactionSlice';
import { api } from '../services/api';
import type { CreateTransactionPayload, TransactionResponse } from '../types';

const mockApi = api as jest.Mocked<typeof api>;

const mockPayload: CreateTransactionPayload = {
  items: [{ productId: '1', quantity: 1 }],
  customer: { email: 'oso@email.com', full_name: 'Oso Pérez', phone_number: '+57' },
  delivery: { address: 'Calle 123', city: 'Medellín', region: 'Antioquia', postal_code: '050001' },
  card: { number: '4242', cvc: '123', exp_month: '12', exp_year: '28', card_holder: 'OSO PEREZ' },
  accept_terms: true,
};

const mockApprovedResponse: TransactionResponse = {
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

const mockPendingResponse: TransactionResponse = {
  transaction: {
    id: 'tx-1',
    amount: 60000,
    base_fee: 3000,
    delivery_fee: 7000,
    status: 'PENDING',
    wompi_transaction_id: 'wompi-tx-1',
  },
  status: 'PENDING',
};

describe('transactionSlice', () => {
  const initialState = {
    id: null,
    status: null,
    wompiTransactionId: null,
    amount: 0,
    loading: false,
    polling: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('resetTransaction', () => {
    it('should reset to initial state', () => {
      const modifiedState = {
        id: 'tx-1',
        status: 'APPROVED' as const,
        wompiTransactionId: 'wompi-tx-1',
        amount: 60000,
        loading: false,
        polling: false,
        error: null,
      };

      const nextState = transactionReducer(modifiedState, resetTransaction());
      expect(nextState).toEqual(initialState);
    });
  });

  describe('createTransaction async thunk', () => {
    it('should set loading on pending', () => {
      const nextState = transactionReducer(initialState, {
        type: createTransaction.pending.type,
      });

      expect(nextState.loading).toBe(true);
      expect(nextState.error).toBeNull();
    });

    it('should handle fulfilled', () => {
      const nextState = transactionReducer(initialState, {
        type: createTransaction.fulfilled.type,
        payload: mockApprovedResponse,
      });

      expect(nextState.loading).toBe(false);
      expect(nextState.id).toBe('tx-1');
      expect(nextState.status).toBe('APPROVED');
      expect(nextState.wompiTransactionId).toBe('wompi-tx-1');
      expect(nextState.amount).toBe(60000);
    });

    it('should handle rejected', () => {
      const nextState = transactionReducer(initialState, {
        type: createTransaction.rejected.type,
        error: { message: 'Transaction failed' },
      });

      expect(nextState.loading).toBe(false);
      expect(nextState.error).toBe('Transaction failed');
      expect(nextState.status).toBe('ERROR');
    });

    it('should call api.createTransaction with payload', async () => {
      mockApi.createTransaction.mockResolvedValue(mockApprovedResponse);

      const dispatch = jest.fn();
      const getState = jest.fn();

      await createTransaction(mockPayload)(dispatch, getState, undefined);

      expect(mockApi.createTransaction).toHaveBeenCalledWith(mockPayload);
    });
  });

  describe('checkTransactionStatus async thunk', () => {
    it('should set loading on pending', () => {
      const nextState = transactionReducer(initialState, {
        type: checkTransactionStatus.pending.type,
      });

      expect(nextState.loading).toBe(true);
    });

    it('should handle fulfilled', () => {
      const nextState = transactionReducer(initialState, {
        type: checkTransactionStatus.fulfilled.type,
        payload: mockApprovedResponse,
      });

      expect(nextState.loading).toBe(false);
      expect(nextState.status).toBe('APPROVED');
      expect(nextState.wompiTransactionId).toBe('wompi-tx-1');
    });

    it('should handle rejected', () => {
      const nextState = transactionReducer(initialState, {
        type: checkTransactionStatus.rejected.type,
        error: { message: 'Failed to check status' },
      });

      expect(nextState.loading).toBe(false);
      expect(nextState.error).toBe('Failed to check status');
    });
  });

  describe('pollTransactionStatus async thunk', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return response when status is not PENDING', async () => {
      mockApi.getTransaction.mockResolvedValue(mockApprovedResponse);

      const dispatch = jest.fn();
      const getState = jest.fn();

      // createAsyncThunk returns { payload, meta, type }
      const result = await pollTransactionStatus('tx-1')(dispatch, getState, undefined);

      // result is a wrapped object, we need to check its payload
      expect((result as any).payload).toEqual(mockApprovedResponse);
      expect(mockApi.getTransaction).toHaveBeenCalledTimes(1);
    });

    it('should handle fulfilled state in reducer', () => {
      const nextState = transactionReducer(initialState, {
        type: pollTransactionStatus.fulfilled.type,
        payload: mockApprovedResponse,
      });

      expect(nextState.polling).toBe(false);
      expect(nextState.status).toBe('APPROVED');
      expect(nextState.wompiTransactionId).toBe('wompi-tx-1');
    });

    it('should handle pending state', () => {
      const stateWithError = { ...initialState, error: 'some error' };
      const nextState = transactionReducer(stateWithError, {
        type: pollTransactionStatus.pending.type,
      });

      expect(nextState.polling).toBe(true);
      expect(nextState.error).toBeNull();
    });

    it('should handle rejected state', () => {
      const nextState = transactionReducer(initialState, {
        type: pollTransactionStatus.rejected.type,
        payload: 'Network error',
        error: { message: 'Network error' },
      });

      expect(nextState.polling).toBe(false);
      expect(nextState.status).toBe('PENDING');
      expect(nextState.error).toBe('Network error');
    });
  });
});