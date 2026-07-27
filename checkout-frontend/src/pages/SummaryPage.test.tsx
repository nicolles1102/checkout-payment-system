import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SummaryPage } from './SummaryPage';
import paymentReducer from '../store/paymentSlice';
import deliveryReducer from '../store/deliverySlice';
import transactionReducer from '../store/transactionSlice';
import cartReducer from '../store/cartSlice';
import type { CartItem } from '../types';

jest.mock('../services/api', () => ({
  api: {
    createTransaction: jest.fn(),
    getTransaction: jest.fn(),
    getProducts: jest.fn(),
  },
}));

const mockCartItems: CartItem[] = [
  {
    product: { id: '1', name: 'Chaquetita Oso', description: 'Test', price: 50000, stock: 10, imageUrl: null, created_at: '' },
    quantity: 1,
  },
];

const createMockStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      cart: cartReducer,
      payment: paymentReducer,
      delivery: deliveryReducer,
      transaction: transactionReducer,
      products: () => ({ items: [], selectedProduct: null, loading: false, error: null }),
    },
    preloadedState: {
      cart: { items: mockCartItems, isOpen: false },
      payment: {
        card: { number: '4242424242424242', cvc: '123', exp_month: '12', exp_year: '28', card_holder: 'OSO PEREZ' },
        baseFee: 3000, deliveryFee: 7000, totalAmount: 0, isProcessing: false, error: null,
      },
      delivery: {
        customer: { email: 'oso@email.com', full_name: 'Oso Pérez', phone_number: '+57 300 123 4567' },
        delivery: { address: 'Calle 123', city: 'Medellín', region: 'Antioquia', postal_code: '050001' },
        acceptTerms: true,
      },
      transaction: { id: null, status: null, wompiTransactionId: null, amount: 0, loading: false, polling: false, error: null },
      ...preloadedState,
    },
  });
};

describe('SummaryPage', () => {
  const onNext = jest.fn();
  const onBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the review title', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <SummaryPage onNext={onNext} onBack={onBack} />
      </Provider>
    );
    expect(screen.getByText('Revisa tu compra')).toBeInTheDocument();
  });

  it('should render product information', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <SummaryPage onNext={onNext} onBack={onBack} />
      </Provider>
    );
    expect(screen.getByText('Chaquetita Oso')).toBeInTheDocument();
  });

  it('should render customer info', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <SummaryPage onNext={onNext} onBack={onBack} />
      </Provider>
    );
    expect(screen.getByText('Datos del comprador')).toBeInTheDocument();
    expect(screen.getByText('Oso Pérez')).toBeInTheDocument();
  });

  it('should render delivery address', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <SummaryPage onNext={onNext} onBack={onBack} />
      </Provider>
    );
    expect(screen.getByText('Dirección de envío')).toBeInTheDocument();
    expect(screen.getByText('Calle 123')).toBeInTheDocument();
  });

  it('should render masked card number', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <SummaryPage onNext={onNext} onBack={onBack} />
      </Provider>
    );
    expect(screen.getByText('**** **** **** 4242')).toBeInTheDocument();
  });

  it('should render price breakdown', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <SummaryPage onNext={onNext} onBack={onBack} />
      </Provider>
    );
    expect(screen.getByText('Resumen de precios')).toBeInTheDocument();
  });

  it('should render total to pay and find the button by partial text', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <SummaryPage onNext={onNext} onBack={onBack} />
      </Provider>
    );
    // The button text uses toLocaleString so locale might format differently
    const payButton = screen.getByRole('button', { name: /pagar/i });
    expect(payButton).toBeInTheDocument();
    expect(payButton.textContent).toContain('$');
  });

  it('should call onBack when edit button is clicked', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <SummaryPage onNext={onNext} onBack={onBack} />
      </Provider>
    );
    const backButton = screen.getByText('Editar información');
    fireEvent.click(backButton);
    expect(onBack).toHaveBeenCalledWith('checkout');
  });

  it('should render Método de pago section', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <SummaryPage onNext={onNext} onBack={onBack} />
      </Provider>
    );
    expect(screen.getByText('Método de pago')).toBeInTheDocument();
  });
});