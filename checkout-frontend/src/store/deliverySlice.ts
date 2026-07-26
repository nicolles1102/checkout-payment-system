import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Customer, Delivery } from '../types';

interface DeliveryState {
  customer: Customer;
  delivery: Delivery;
  acceptTerms: boolean;
}

const initialState: DeliveryState = {
  customer: {
    email: '',
    full_name: '',
    phone_number: '',
  },
  delivery: {
    address: '',
    city: '',
    region: '',
    postal_code: '',
  },
  acceptTerms: false,
};

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    updateCustomer: (state, action: PayloadAction<Partial<Customer>>) => {
      state.customer = { ...state.customer, ...action.payload };
    },
    updateDelivery: (state, action: PayloadAction<Partial<Delivery>>) => {
      state.delivery = { ...state.delivery, ...action.payload };
    },
    setAcceptTerms: (state, action: PayloadAction<boolean>) => {
      state.acceptTerms = action.payload;
    },
    resetDelivery: () => initialState,
  },
});

export const { updateCustomer, updateDelivery, setAcceptTerms, resetDelivery } = deliverySlice.actions;
export default deliverySlice.reducer;