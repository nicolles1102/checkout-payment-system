jest.mock('../services/api', () => ({
  api: {
    getProducts: jest.fn(),
    getProduct: jest.fn(),
    createTransaction: jest.fn(),
    getTransaction: jest.fn(),
  },
}));

import productsReducer, {
  setSelectedProduct,
  updateProductStock,
  clearSelectedProduct,
  fetchProducts,
  fetchProductById,
} from './productsSlice';
import { api } from '../services/api';
import type { Product } from '../types';

const mockApi = api as jest.Mocked<typeof api>;

const mockProduct1: Product = {
  id: '1',
  name: 'Chaquetita Oso',
  description: 'Para perritos',
  price: 50000,
  stock: 10,
  imageUrl: null,
  created_at: '2024-01-01T00:00:00Z',
};

const mockProduct2: Product = {
  id: '2',
  name: 'Chaquetita Luna',
  description: 'Para gaticos',
  price: 45000,
  stock: 5,
  imageUrl: null,
  created_at: '2024-01-01T00:00:00Z',
};

describe('productsSlice', () => {
  const initialState = {
    items: [] as Product[],
    selectedProduct: null as Product | null,
    loading: false,
    error: null as string | null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setSelectedProduct', () => {
    it('should set selected product', () => {
      const nextState = productsReducer(initialState, setSelectedProduct(mockProduct1));
      expect(nextState.selectedProduct).toEqual(mockProduct1);
    });
  });

  describe('clearSelectedProduct', () => {
    it('should clear selected product', () => {
      const stateWithSelected = { ...initialState, selectedProduct: mockProduct1 };
      const nextState = productsReducer(stateWithSelected, clearSelectedProduct());
      expect(nextState.selectedProduct).toBeNull();
    });
  });

  describe('updateProductStock', () => {
    it('should update stock for a matching product in items list', () => {
      const stateWithItems = { ...initialState, items: [mockProduct1, mockProduct2] };
      const nextState = productsReducer(stateWithItems, updateProductStock({ id: '1', stock: 5 }));
      expect(nextState.items[0].stock).toBe(5);
      // Product 2 should keep its original stock
      expect(nextState.items[1].stock).toBe(5);
    });

    it('should also update selectedProduct stock if it matches', () => {
      const stateWithSelected = {
        ...initialState,
        items: [mockProduct1],
        selectedProduct: mockProduct1,
      };
      const nextState = productsReducer(stateWithSelected, updateProductStock({ id: '1', stock: 3 }));
      expect(nextState.selectedProduct!.stock).toBe(3);
    });

    it('should not update if product id does not match', () => {
      const stateWithItems = { ...initialState, items: [mockProduct1] };
      const nextState = productsReducer(stateWithItems, updateProductStock({ id: 'nonexistent', stock: 5 }));
      expect(nextState.items[0].stock).toBe(10);
    });
  });

  describe('fetchProducts async thunk', () => {
    it('should set loading on pending', () => {
      const nextState = productsReducer(initialState, {
        type: fetchProducts.pending.type,
      });
      expect(nextState.loading).toBe(true);
      expect(nextState.error).toBeNull();
    });

    it('should handle fulfilled', () => {
      const nextState = productsReducer(initialState, {
        type: fetchProducts.fulfilled.type,
        payload: [mockProduct1, mockProduct2],
      });
      expect(nextState.loading).toBe(false);
      expect(nextState.items).toEqual([mockProduct1, mockProduct2]);
    });

    it('should handle rejected', () => {
      const nextState = productsReducer(initialState, {
        type: fetchProducts.rejected.type,
        error: { message: 'Failed to fetch products' },
      });
      expect(nextState.loading).toBe(false);
      expect(nextState.error).toBe('Failed to fetch products');
    });

    it('should call api.getProducts', async () => {
      mockApi.getProducts.mockResolvedValue([mockProduct1]);

      const dispatch = jest.fn();
      const getState = jest.fn();

      await fetchProducts()(dispatch, getState, undefined);
      expect(mockApi.getProducts).toHaveBeenCalled();
    });
  });

  describe('fetchProductById async thunk', () => {
    it('should set loading on pending', () => {
      const nextState = productsReducer(initialState, {
        type: fetchProductById.pending.type,
      });
      expect(nextState.loading).toBe(true);
      expect(nextState.error).toBeNull();
    });

    it('should handle fulfilled', () => {
      const nextState = productsReducer(initialState, {
        type: fetchProductById.fulfilled.type,
        payload: mockProduct1,
      });
      expect(nextState.loading).toBe(false);
      expect(nextState.selectedProduct).toEqual(mockProduct1);
    });

    it('should handle rejected', () => {
      const nextState = productsReducer(initialState, {
        type: fetchProductById.rejected.type,
        error: { message: 'Failed to fetch product' },
      });
      expect(nextState.loading).toBe(false);
      expect(nextState.error).toBe('Failed to fetch product');
    });

    it('should call api.getProduct with id', async () => {
      mockApi.getProduct.mockResolvedValue(mockProduct1);

      const dispatch = jest.fn();
      const getState = jest.fn();

      await fetchProductById('1')(dispatch, getState, undefined);
      expect(mockApi.getProduct).toHaveBeenCalledWith('1');
    });
  });
});