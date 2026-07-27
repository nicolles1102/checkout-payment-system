import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../../store/cartSlice';
import { Header } from './Header';
import type { CartItem } from '../../types';

const createMockStore = (cartState = { items: [] as CartItem[], isOpen: false }) => {
  return configureStore({
    reducer: {
      cart: cartReducer,
      products: () => ({ items: [], selectedProduct: null, loading: false, error: null }),
      payment: () => ({ card: { number: '', cvc: '', exp_month: '', exp_year: '', card_holder: '' }, baseFee: 3000, deliveryFee: 7000, totalAmount: 0, isProcessing: false, error: null }),
      delivery: () => ({ customer: { email: '', full_name: '', phone_number: '' }, delivery: { address: '', city: '', region: '', postal_code: '' }, acceptTerms: false }),
      transaction: () => ({ id: null, status: null, wompiTransactionId: null, amount: 0, loading: false, polling: false, error: null }),
    },
    preloadedState: { cart: cartState },
  });
};

describe('Header', () => {
  it('should render the store name', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Header />
      </Provider>
    );
    expect(screen.getByText("Oso's Pet Boutique")).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Header />
      </Provider>
    );
    expect(screen.getByText('Chaquetas con amor 🐾')).toBeInTheDocument();
  });

  it('should not show cart badge number when cart is empty', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Header />
      </Provider>
    );
    // The badge span with number should not be in the document
    // Only shown when cartCount > 0
    const badgeNumbers = screen.queryAllByText(/^\d+$/);
    expect(badgeNumbers.length).toBe(0);
  });

  it('should show cart badge when items are in cart', () => {
    const store = createMockStore({
      items: [{ product: { id: '1', name: 'Test', description: 'Test', price: 100, stock: 10, imageUrl: null, created_at: '' }, quantity: 2 }],
      isOpen: false,
    });
    render(
      <Provider store={store}>
        <Header />
      </Provider>
    );
    // The badge should show with the quantity number
    const badge = screen.getByText('2');
    expect(badge).toBeInTheDocument();
  });

  it('should dispatch toggleCart on cart button click', () => {
    const store = createMockStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    render(
      <Provider store={store}>
        <Header />
      </Provider>
    );
    const cartButton = screen.getByRole('button');
    fireEvent.click(cartButton);
    expect(dispatchSpy).toHaveBeenCalled();
  });
});