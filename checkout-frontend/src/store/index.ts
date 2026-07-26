import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './productsSlice';
import paymentReducer from './paymentSlice';
import deliveryReducer from './deliverySlice';
import transactionReducer from './transactionSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    payment: paymentReducer,
    delivery: deliveryReducer,
    transaction: transactionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;