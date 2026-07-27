import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, Product } from '../types';
import type { RootState } from './index';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      const { product, quantity } = action.payload;
      const existing = state.items.find((item) => item.product.id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.product.id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((i) => i.product.id === productId);
      if (item) {
        item.quantity = Math.max(1, Math.min(quantity, item.product.stock));
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

// Selectors
const selectCartState = (state: RootState) => state.cart;

export const selectCartItems = createSelector(
  [selectCartState],
  (cart) => cart.items,
);

export const selectCartCount = createSelector(
  [selectCartState],
  (cart) => cart.items.reduce((acc, item) => acc + item.quantity, 0),
);

export const selectCartSubtotal = createSelector(
  [selectCartState],
  (cart) => cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
);

export const selectCartOpen = createSelector(
  [selectCartState],
  (cart) => cart.isOpen,
);

export const selectCartItemCount = (productId: string) =>
  createSelector([selectCartItems], (items) =>
    items.find((i) => i.product.id === productId)?.quantity ?? 0,
  );

export const { addToCart, removeFromCart, updateQuantity, clearCart, openCart, closeCart, toggleCart } = cartSlice.actions;
export default cartSlice.reducer;