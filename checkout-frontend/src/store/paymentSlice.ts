import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CardInfo } from '../types';

const BASE_FEE = 3000;
const DELIVERY_FEE = 7000;

interface PaymentState {
  card: CardInfo;
  baseFee: number;
  deliveryFee: number;
  totalAmount: number;
  isProcessing: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  card: {
    number: '',
    cvc: '',
    exp_month: '',
    exp_year: '',
    card_holder: '',
  },
  baseFee: BASE_FEE,
  deliveryFee: DELIVERY_FEE,
  totalAmount: 0,
  isProcessing: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    updateCardInfo: (state, action: PayloadAction<Partial<CardInfo>>) => {
      state.card = { ...state.card, ...action.payload };
    },
    setBaseFee: (state, action: PayloadAction<number>) => {
      state.baseFee = action.payload;
    },
    setDeliveryFee: (state, action: PayloadAction<number>) => {
      state.deliveryFee = action.payload;
    },
    calculateTotal: (state) => {
      state.totalAmount = state.baseFee + state.deliveryFee;
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setPaymentError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isProcessing = false;
    },
    resetPayment: () => initialState,
  },
});

export const {
  updateCardInfo,
  setBaseFee,
  setDeliveryFee,
  calculateTotal,
  setProcessing,
  setPaymentError,
  resetPayment,
} = paymentSlice.actions;
export default paymentSlice.reducer;