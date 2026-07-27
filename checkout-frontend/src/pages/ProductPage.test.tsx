import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ProductPage } from './ProductPage';
import productsReducer from '../store/productsSlice';
import cartReducer from '../store/cartSlice';

jest.mock('../services/api', () => ({
  api: {
    getProducts: jest.fn(),
    createTransaction: jest.fn(),
    getTransaction: jest.fn(),
  },
}));

import { api } from '../services/api';
const mockApi = api as jest.Mocked<typeof api>;

const mockProducts = [
  {
    id: '1',
    name: 'Chaquetita Oso',
    description: 'Para perritos',
    price: 50000,
    stock: 10,
    imageUrl: 'https://example.com/img.jpg',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Chaquetita Luna',
    description: 'Para gaticos',
    price: 45000,
    stock: 0,
    imageUrl: null,
    created_at: '2024-01-01T00:00:00Z',
  },
];

const createMockStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      products: productsReducer,
      cart: cartReducer,
      payment: () => ({ card: { number: '', cvc: '', exp_month: '', exp_year: '', card_holder: '' }, baseFee: 3000, deliveryFee: 7000, totalAmount: 0, isProcessing: false, error: null }),
      delivery: () => ({ customer: { email: '', full_name: '', phone_number: '' }, delivery: { address: '', city: '', region: '', postal_code: '' }, acceptTerms: false }),
      transaction: () => ({ id: null, status: null, wompiTransactionId: null, amount: 0, loading: false, polling: false, error: null }),
    },
    preloadedState,
  });
};

describe('ProductPage', () => {
  const onNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state initially', () => {
    mockApi.getProducts.mockReturnValue(new Promise(() => {}));
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProductPage onNext={onNext} />
      </Provider>
    );
    expect(screen.getByText(/Oso está buscando/)).toBeInTheDocument();
  });

  it('should show error state when fetch fails', async () => {
    mockApi.getProducts.mockRejectedValue(new Error('Network error'));
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProductPage onNext={onNext} />
      </Provider>
    );
    await waitFor(() => {
      expect(screen.getByText(/Oso tuvo un problema/)).toBeInTheDocument();
    });
  });

  it('should render products when loaded', async () => {
    mockApi.getProducts.mockResolvedValue(mockProducts);
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProductPage onNext={onNext} />
      </Provider>
    );
    await waitFor(() => {
      expect(screen.getByText('Chaquetita Oso')).toBeInTheDocument();
    });
    expect(screen.getByText('Chaquetita Luna')).toBeInTheDocument();
  });

  it('should show out of stock badge for products with stock 0', async () => {
    mockApi.getProducts.mockResolvedValue(mockProducts);
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProductPage onNext={onNext} />
      </Provider>
    );
    await waitFor(() => {
      expect(screen.getByText('Agotado')).toBeInTheDocument();
    });
  });

  it('should show low stock badge for products with stock <= 5', async () => {
    const lowStockProducts = [{ ...mockProducts[0], stock: 2 }];
    mockApi.getProducts.mockResolvedValue(lowStockProducts);
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProductPage onNext={onNext} />
      </Provider>
    );
    await waitFor(() => {
      // Check for "Últimos" badge text
      expect(screen.getByText(/Últimos/)).toBeInTheDocument();
    });
  });

  it('should show product price and stock', async () => {
    mockApi.getProducts.mockResolvedValue(mockProducts);
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProductPage onNext={onNext} />
      </Provider>
    );
    await waitFor(() => {
      expect(screen.getByText('Chaquetita Oso')).toBeInTheDocument();
    });
    // Price contains the number 50000 somehow formatted
    const priceElements = screen.getAllByText(/50/, { exact: false });
    expect(priceElements.length).toBeGreaterThan(0);
    // Stock info
    expect(screen.getByText('10 disp.')).toBeInTheDocument();
  });
});