import cartReducer, { addToCart, removeFromCart, updateQuantity, clearCart, openCart, closeCart, toggleCart } from './cartSlice';
import type { Product, CartItem } from '../types';

const mockProduct: Product = {
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

describe('cartSlice', () => {
  const initialState = {
    items: [] as CartItem[],
    isOpen: false,
  };

  describe('addToCart', () => {
    it('should add a new product to cart', () => {
      const nextState = cartReducer(initialState, addToCart({ product: mockProduct, quantity: 1 }));

      expect(nextState.items).toHaveLength(1);
      expect(nextState.items[0].product.id).toBe('1');
      expect(nextState.items[0].quantity).toBe(1);
    });

    it('should increase quantity if product already in cart', () => {
      const stateWithItem = {
        items: [{ product: mockProduct, quantity: 1 }],
        isOpen: false,
      };

      const nextState = cartReducer(stateWithItem, addToCart({ product: mockProduct, quantity: 2 }));

      expect(nextState.items).toHaveLength(1);
      expect(nextState.items[0].quantity).toBe(3);
    });

    it('should add multiple different products', () => {
      let state = cartReducer(initialState, addToCart({ product: mockProduct, quantity: 1 }));
      state = cartReducer(state, addToCart({ product: mockProduct2, quantity: 2 }));

      expect(state.items).toHaveLength(2);
      expect(state.items[0].product.id).toBe('1');
      expect(state.items[1].product.id).toBe('2');
    });
  });

  describe('removeFromCart', () => {
    it('should remove product from cart', () => {
      const stateWithItems = {
        items: [
          { product: mockProduct, quantity: 1 },
          { product: mockProduct2, quantity: 1 },
        ],
        isOpen: false,
      };

      const nextState = cartReducer(stateWithItems, removeFromCart('1'));

      expect(nextState.items).toHaveLength(1);
      expect(nextState.items[0].product.id).toBe('2');
    });

    it('should do nothing if product id does not exist', () => {
      const stateWithItems = {
        items: [{ product: mockProduct, quantity: 1 }],
        isOpen: false,
      };

      const nextState = cartReducer(stateWithItems, removeFromCart('nonexistent'));

      expect(nextState.items).toHaveLength(1);
    });
  });

  describe('updateQuantity', () => {
    it('should update quantity of existing product', () => {
      const stateWithItems = {
        items: [{ product: mockProduct, quantity: 1 }],
        isOpen: false,
      };

      const nextState = cartReducer(stateWithItems, updateQuantity({ productId: '1', quantity: 5 }));

      expect(nextState.items[0].quantity).toBe(5);
    });

    it('should not go below 1', () => {
      const stateWithItems = {
        items: [{ product: mockProduct, quantity: 3 }],
        isOpen: false,
      };

      const nextState = cartReducer(stateWithItems, updateQuantity({ productId: '1', quantity: 0 }));

      expect(nextState.items[0].quantity).toBe(1);
    });

    it('should not exceed stock', () => {
      const stateWithItems = {
        items: [{ product: mockProduct, quantity: 1 }],
        isOpen: false,
      };

      const nextState = cartReducer(stateWithItems, updateQuantity({ productId: '1', quantity: 20 }));

      expect(nextState.items[0].quantity).toBe(10);
    });

    it('should do nothing if product does not exist', () => {
      const stateWithItems = {
        items: [{ product: mockProduct, quantity: 1 }],
        isOpen: false,
      };

      const nextState = cartReducer(stateWithItems, updateQuantity({ productId: 'nonexistent', quantity: 5 }));

      expect(nextState.items).toHaveLength(1);
      expect(nextState.items[0].quantity).toBe(1);
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', () => {
      const stateWithItems = {
        items: [
          { product: mockProduct, quantity: 1 },
          { product: mockProduct2, quantity: 2 },
        ],
        isOpen: false,
      };

      const nextState = cartReducer(stateWithItems, clearCart());

      expect(nextState.items).toEqual([]);
    });
  });

  describe('cart open/close', () => {
    it('should start closed', () => {
      expect(initialState.isOpen).toBe(false);
    });

    it('should open cart', () => {
      const nextState = cartReducer(initialState, openCart());
      expect(nextState.isOpen).toBe(true);
    });

    it('should close cart', () => {
      const openState = { items: [], isOpen: true };
      const nextState = cartReducer(openState, closeCart());
      expect(nextState.isOpen).toBe(false);
    });

    it('should toggle cart', () => {
      const nextState = cartReducer(initialState, toggleCart());
      expect(nextState.isOpen).toBe(true);

      const toggledBack = cartReducer(nextState, toggleCart());
      expect(toggledBack.isOpen).toBe(false);
    });
  });
});