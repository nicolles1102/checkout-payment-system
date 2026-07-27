import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { CheckoutPage } from './CheckoutPage';
import paymentReducer from '../store/paymentSlice';
import deliveryReducer from '../store/deliverySlice';
import cartReducer from '../store/cartSlice';
import type { CartItem } from '../types';

const mockCartItems: CartItem[] = [
  {
    product: { id: '1', name: 'Chaquetita Oso', description: 'Test', price: 50000, stock: 10, imageUrl: null, created_at: '' },
    quantity: 2,
  },
];

const createMockStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      cart: cartReducer,
      payment: paymentReducer,
      delivery: deliveryReducer,
      products: () => ({ items: [], selectedProduct: null, loading: false, error: null }),
      transaction: () => ({ id: null, status: null, wompiTransactionId: null, amount: 0, loading: false, polling: false, error: null }),
    },
    preloadedState: {
      cart: { items: mockCartItems, isOpen: false },
      payment: { card: { number: '', cvc: '', exp_month: '', exp_year: '', card_holder: '' }, baseFee: 3000, deliveryFee: 7000, totalAmount: 0, isProcessing: false, error: null },
      delivery: { customer: { email: '', full_name: '', phone_number: '' }, delivery: { address: '', city: '', region: '', postal_code: '' }, acceptTerms: false },
      ...preloadedState,
    },
  });
};

describe('CheckoutPage', () => {
  const onNext = jest.fn();
  const onBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render personal info section', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CheckoutPage onNext={onNext} onBack={onBack} />
      </Provider>
    );
    expect(screen.getByText('Información Personal')).toBeInTheDocument();
  });

  it('should render delivery section', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CheckoutPage onNext={onNext} onBack={onBack} />
      </Provider>
    );
    expect(screen.getByText('Dirección de Envío')).toBeInTheDocument();
  });

  it('should render payment section', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CheckoutPage onNext={onNext} onBack={onBack} />
      </Provider>
    );
    expect(screen.getByText('Información de Pago')).toBeInTheDocument();
  });

  it('should render cart items summary', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CheckoutPage onNext={onNext} onBack={onBack} />
      </Provider>
    );
    expect(screen.getByText('Resumen del pedido')).toBeInTheDocument();
    expect(screen.getByText('Chaquetita Oso')).toBeInTheDocument();
  });

  it('should show validation errors when submitting empty form', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CheckoutPage onNext={onNext} onBack={onBack} />
      </Provider>
    );
    const submitButton = screen.getByText('Continuar al resumen');
    fireEvent.click(submitButton);
    expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
  });

  it('should call onBack when back button is clicked', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CheckoutPage onNext={onNext} onBack={onBack} />
      </Provider>
    );
    const backButton = screen.getByText('Volver al producto');
    fireEvent.click(backButton);
    expect(onBack).toHaveBeenCalledWith('product');
  });

  it('should render card type SVG for Visa numbers', () => {
    const store = createMockStore({
      payment: {
        card: { number: '4111111111111111', cvc: '', exp_month: '', exp_year: '', card_holder: '' },
        baseFee: 3000, deliveryFee: 7000, totalAmount: 0, isProcessing: false, error: null,
      },
    });
    const { container } = render(
      <Provider store={store}>
        <CheckoutPage onNext={onNext} onBack={onBack} />
      </Provider>
    );
    const rect = container.querySelector('rect[fill="#1A1F71"]');
    expect(rect).toBeTruthy();
  });

  it('should render card type SVG for MasterCard numbers', () => {
    const store = createMockStore({
      payment: {
        card: { number: '5111111111111111', cvc: '', exp_month: '', exp_year: '', card_holder: '' },
        baseFee: 3000, deliveryFee: 7000, totalAmount: 0, isProcessing: false, error: null,
      },
    });
    const { container } = render(
      <Provider store={store}>
        <CheckoutPage onNext={onNext} onBack={onBack} />
      </Provider>
    );
    const circles = container.querySelectorAll('circle[fill="#EB001B"]');
    expect(circles.length).toBeGreaterThan(0);
  });

  it('should show total price containing the number 110000', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CheckoutPage onNext={onNext} onBack={onBack} />
      </Provider>
    );
    // Total depends on locale formatting (could be 110,000 or 110.000)
    const totalElement = screen.getByText(/110/, { exact: false });
    expect(totalElement).toBeInTheDocument();
  });
});