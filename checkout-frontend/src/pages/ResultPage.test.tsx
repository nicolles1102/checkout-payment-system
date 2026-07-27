import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ResultPage } from './ResultPage';
import transactionReducer from '../store/transactionSlice';
import paymentReducer from '../store/paymentSlice';
import deliveryReducer from '../store/deliverySlice';
import productsReducer from '../store/productsSlice';

jest.mock('../services/api', () => ({
  api: {
    getTransaction: jest.fn(),
    getProducts: jest.fn(),
    createTransaction: jest.fn(),
  },
}));

const createMockStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      transaction: transactionReducer,
      payment: paymentReducer,
      delivery: deliveryReducer,
      products: productsReducer,
      cart: () => ({ items: [], isOpen: false }),
    },
    preloadedState: {
      transaction: { id: null, status: null, wompiTransactionId: null, amount: 0, loading: false, polling: false, error: null },
      payment: { card: { number: '', cvc: '', exp_month: '', exp_year: '', card_holder: '' }, baseFee: 3000, deliveryFee: 7000, totalAmount: 0, isProcessing: false, error: null },
      delivery: { customer: { email: '', full_name: '', phone_number: '' }, delivery: { address: '', city: '', region: '', postal_code: '' }, acceptTerms: false },
      products: { items: [], selectedProduct: null, loading: false, error: null },
      ...preloadedState,
    },
  });
};

describe('ResultPage', () => {
  const onRestart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state when transaction is pending and has id', () => {
    const store = createMockStore({
      transaction: { id: 'tx-1', status: 'PENDING', wompiTransactionId: 'wompi-1', amount: 60000, loading: false, polling: true, error: null },
    });
    render(
      <Provider store={store}>
        <ResultPage onRestart={onRestart} />
      </Provider>
    );
    expect(screen.getByText('Oso está verificando tu pago')).toBeInTheDocument();
  });

  it('should show approved status', () => {
    const store = createMockStore({
      transaction: { id: 'tx-1', status: 'APPROVED', wompiTransactionId: 'wompi-1', amount: 60000, loading: false, polling: false, error: null },
    });
    render(
      <Provider store={store}>
        <ResultPage onRestart={onRestart} />
      </Provider>
    );
    expect(screen.getByText('¡Pago aprobado! 🎉')).toBeInTheDocument();
  });

  it('should show declined status', () => {
    const store = createMockStore({
      transaction: { id: 'tx-1', status: 'DECLINED', wompiTransactionId: 'wompi-1', amount: 60000, loading: false, polling: false, error: null },
    });
    render(
      <Provider store={store}>
        <ResultPage onRestart={onRestart} />
      </Provider>
    );
    expect(screen.getByText('Pago declinado')).toBeInTheDocument();
  });

  it('should show error status', () => {
    const store = createMockStore({
      transaction: { id: 'tx-1', status: 'ERROR', wompiTransactionId: null, amount: 60000, loading: false, polling: false, error: null },
    });
    render(
      <Provider store={store}>
        <ResultPage onRestart={onRestart} />
      </Provider>
    );
    expect(screen.getByText('Error en el pago')).toBeInTheDocument();
  });

  it('should show transaction details when id is present', () => {
    const store = createMockStore({
      transaction: { id: 'tx-1', status: 'APPROVED', wompiTransactionId: 'wompi-1', amount: 60000, loading: false, polling: false, error: null },
    });
    render(
      <Provider store={store}>
        <ResultPage onRestart={onRestart} />
      </Provider>
    );
    expect(screen.getByText('Detalles de la transacción')).toBeInTheDocument();
    expect(screen.getByText('tx-1')).toBeInTheDocument();
    // Amount uses locale, could contain 60.000 or 60,000
    const amountElements = screen.getAllByText(/60/, { exact: false });
    expect(amountElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Wompi')).toBeInTheDocument();
  });

  it('should show "Seguir comprando" button when approved', () => {
    const store = createMockStore({
      transaction: { id: 'tx-1', status: 'APPROVED', wompiTransactionId: 'wompi-1', amount: 60000, loading: false, polling: false, error: null },
    });
    render(
      <Provider store={store}>
        <ResultPage onRestart={onRestart} />
      </Provider>
    );
    expect(screen.getByText('Seguir comprando')).toBeInTheDocument();
  });

  it('should show "Intentar de nuevo" when declined', () => {
    const store = createMockStore({
      transaction: { id: 'tx-1', status: 'DECLINED', wompiTransactionId: 'wompi-1', amount: 60000, loading: false, polling: false, error: null },
    });
    render(
      <Provider store={store}>
        <ResultPage onRestart={onRestart} />
      </Provider>
    );
    expect(screen.getByText('Intentar de nuevo')).toBeInTheDocument();
  });

  it('should call onRestart when restart button is clicked', () => {
    const store = createMockStore({
      transaction: { id: 'tx-1', status: 'APPROVED', wompiTransactionId: 'wompi-1', amount: 60000, loading: false, polling: false, error: null },
    });
    render(
      <Provider store={store}>
        <ResultPage onRestart={onRestart} />
      </Provider>
    );
    const restartButton = screen.getByText('Seguir comprando');
    fireEvent.click(restartButton);
    expect(onRestart).toHaveBeenCalled();
  });
});