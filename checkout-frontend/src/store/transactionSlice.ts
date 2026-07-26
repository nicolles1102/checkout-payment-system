import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';
import type { CreateTransactionPayload, TransactionResponse } from '../types';

interface TransactionState {
  id: string | null;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' | null;
  wompiTransactionId: string | null;
  amount: number;
  loading: boolean;
  polling: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  id: null,
  status: null,
  wompiTransactionId: null,
  amount: 0,
  loading: false,
  polling: false,
  error: null,
};

export const createTransaction = createAsyncThunk(
  'transaction/create',
  async (payload: CreateTransactionPayload) => {
    const response = await api.createTransaction(payload);
    return response;
  }
);

export const checkTransactionStatus = createAsyncThunk(
  'transaction/checkStatus',
  async (id: string) => {
    const response = await api.getTransaction(id);
    return response;
  }
);

const POLL_INTERVAL = 3000; // 3 seconds
const MAX_POLL_TIME = 30000; // 30 seconds timeout

export const pollTransactionStatus = createAsyncThunk<
  TransactionResponse,
  string,
  { rejectValue: string }
>(
  'transaction/pollStatus',
  async (id: string, { rejectWithValue }) => {
    const startTime = Date.now();

    const poll = async (): Promise<TransactionResponse> => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= MAX_POLL_TIME) {
        throw new Error('Tiempo de espera agotado. La transacción sigue pendiente.');
      }

      const response = await api.getTransaction(id);

      // If we got a final status, return it
      if (response.status !== 'PENDING') {
        return response;
      }

      // Otherwise wait and poll again
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      return poll();
    };

    return poll();
  }
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    resetTransaction: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.id = action.payload.transaction.id ?? null;
        state.status = action.payload.status;
        state.wompiTransactionId = action.payload.transaction.wompi_transaction_id;
        state.amount = action.payload.transaction.amount;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Transaction failed';
        state.status = 'ERROR';
      })
      .addCase(checkTransactionStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkTransactionStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload.status;
        state.wompiTransactionId = action.payload.transaction.wompi_transaction_id;
      })
      .addCase(checkTransactionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to check status';
      })
      .addCase(pollTransactionStatus.pending, (state) => {
        state.polling = true;
        state.error = null;
      })
      .addCase(pollTransactionStatus.fulfilled, (state, action) => {
        state.polling = false;
        state.status = action.payload.status;
        state.wompiTransactionId = action.payload.transaction.wompi_transaction_id;
      })
      .addCase(pollTransactionStatus.rejected, (state, action) => {
        state.polling = false;
        state.status = 'PENDING';
        state.error = (action.payload as string) || action.error.message || 'Failed to check transaction status';
      });
  },
});

export const { resetTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;
