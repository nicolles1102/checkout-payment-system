import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import productsReducer from './productsSlice';
import paymentReducer from './paymentSlice';
import deliveryReducer from './deliverySlice';
import transactionReducer from './transactionSlice';
import cartReducer from './cartSlice';

// Custom storage with Promise-based API (required by redux-persist)
const storage = {
  getItem: (key: string): Promise<string | null> => {
    try {
      return Promise.resolve(localStorage.getItem(key));
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: string): Promise<void> => {
    try {
      localStorage.setItem(key, value);
      return Promise.resolve();
    } catch {
      return Promise.resolve();
    }
  },
  removeItem: (key: string): Promise<void> => {
    try {
      localStorage.removeItem(key);
      return Promise.resolve();
    } catch {
      return Promise.resolve();
    }
  },
};

const persistConfig = {
  key: 'checkout-root',
  storage,
  whitelist: ['cart', 'payment', 'delivery', 'transaction'],
};

const rootReducer = combineReducers({
  products: productsReducer,
  payment: paymentReducer,
  delivery: deliveryReducer,
  transaction: transactionReducer,
  cart: cartReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;