import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ProductDetailPage } from './ProductDetailPage';
import cartReducer from '../store/cartSlice';
import type { Product } from '../types';

const mockProduct: Product = {
  id: '1',
  name: 'Chaquetita Oso',
  description: 'Para perritos',
  price: 50000,
  stock: 10,
  imageUrl: null,
  created_at: '2024-01-01T00:00:00Z',
};

const createMockStore = () => {
  return configureStore({
    reducer: {
      cart: cartReducer,
      products: () => ({ items: [], selectedProduct: null, loading: false, error: null }),
      payment: () => ({ card: { number: '', cvc: '', exp_month: '', exp_year: '', card_holder: '' }, baseFee: 3000, deliveryFee: 7000, totalAmount: 0, isProcessing: false, error: null }),
      delivery: () => ({ customer: { email: '', full_name: '', phone_number: '' }, delivery: { address: '', city: '', region: '', postal_code: '' }, acceptTerms: false }),
      transaction: () => ({ id: null, status: null, wompiTransactionId: null, amount: 0, loading: false, polling: false, error: null }),
    },
  });
};

describe('ProductDetailPage', () => {
  const onBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render product name', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProductDetailPage product={mockProduct} onBack={onBack} />
      </Provider>
    );
    expect(screen.getByText('Chaquetita Oso')).toBeInTheDocument();
  });

  it('should render product description', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProductDetailPage product={mockProduct} onBack={onBack} />
      </Provider>
    );
    expect(screen.getByText('Para perritos')).toBeInTheDocument();
  });

  it('should render product price', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProductDetailPage product={mockProduct} onBack={onBack} />
      </Provider>
    );
    // Price uses toLocaleString - could be $50,000 or $50.000 depending on locale
    const priceElements = screen.getAllByText(/50\./, { exact: false });
    expect(priceElements.length).toBeGreaterThan(0);
  });

  it('should show add to cart button with quantity', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProductDetailPage product={mockProduct} onBack={onBack} />
      </Provider>
    );
    expect(screen.getByText(/Agregar al carrito/)).toBeInTheDocument();
  });

  it('should show out of stock when stock is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProductDetailPage product={outOfStockProduct} onBack={onBack} />
      </Provider>
    );
    expect(screen.getByText('Agotado')).toBeInTheDocument();
  });

  it('should show quantity = 1 by default', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProductDetailPage product={mockProduct} onBack={onBack} />
      </Provider>
    );
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should call onBack when back button is clicked', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProductDetailPage product={mockProduct} onBack={onBack} />
      </Provider>
    );
    const backButton = screen.getByText('Volver a productos');
    fireEvent.click(backButton);
    expect(onBack).toHaveBeenCalledWith('product');
  });

  it('should show stock count in stock badge', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProductDetailPage product={mockProduct} onBack={onBack} />
      </Provider>
    );
    expect(screen.getByText('10 en stock')).toBeInTheDocument();
  });

  it('should show low stock warning when stock <= 5', () => {
    const lowStockProduct = { ...mockProduct, stock: 3 };
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProductDetailPage product={lowStockProduct} onBack={onBack} />
      </Provider>
    );
    expect(screen.getByText('Últimos 3')).toBeInTheDocument();
  });
});