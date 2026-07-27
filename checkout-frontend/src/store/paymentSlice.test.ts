import paymentReducer, { updateCardInfo, setBaseFee, setDeliveryFee, calculateTotal, setProcessing, setPaymentError, resetPayment } from './paymentSlice';
import type { CardInfo } from '../types';

describe('paymentSlice', () => {
  const initialState = {
    card: {
      number: '',
      cvc: '',
      exp_month: '',
      exp_year: '',
      card_holder: '',
    } as CardInfo,
    baseFee: 3000,
    deliveryFee: 7000,
    totalAmount: 0,
    isProcessing: false,
    error: null,
  };

  describe('updateCardInfo', () => {
    it('should update card number', () => {
      const nextState = paymentReducer(initialState, updateCardInfo({ number: '4242424242424242' }));
      expect(nextState.card.number).toBe('4242424242424242');
    });

    it('should update multiple card fields at once', () => {
      const nextState = paymentReducer(initialState, updateCardInfo({
        number: '4111111111111111',
        cvc: '123',
      }));
      expect(nextState.card.number).toBe('4111111111111111');
      expect(nextState.card.cvc).toBe('123');
    });

    it('should keep existing fields when partial update', () => {
      const stateWithCard = {
        ...initialState,
        card: { number: '4242', cvc: '123', exp_month: '12', exp_year: '28', card_holder: 'OSO' },
      };
      const nextState = paymentReducer(stateWithCard, updateCardInfo({ card_holder: 'NEW HOLDER' }));
      expect(nextState.card.number).toBe('4242');
      expect(nextState.card.card_holder).toBe('NEW HOLDER');
    });
  });

  describe('setBaseFee', () => {
    it('should set base fee', () => {
      const nextState = paymentReducer(initialState, setBaseFee(5000));
      expect(nextState.baseFee).toBe(5000);
    });
  });

  describe('setDeliveryFee', () => {
    it('should set delivery fee', () => {
      const nextState = paymentReducer(initialState, setDeliveryFee(10000));
      expect(nextState.deliveryFee).toBe(10000);
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total as baseFee + deliveryFee', () => {
      const state = { ...initialState, baseFee: 3000, deliveryFee: 7000 };
      const nextState = paymentReducer(state, calculateTotal());
      expect(nextState.totalAmount).toBe(10000);
    });
  });

  describe('setProcessing', () => {
    it('should set processing to true and clear error', () => {
      const stateWithError = { ...initialState, error: 'Some error' };
      const nextState = paymentReducer(stateWithError, setProcessing(true));
      expect(nextState.isProcessing).toBe(true);
      expect(nextState.error).toBeNull();
    });

    it('should set processing to false', () => {
      const stateProcessing = { ...initialState, isProcessing: true };
      const nextState = paymentReducer(stateProcessing, setProcessing(false));
      expect(nextState.isProcessing).toBe(false);
    });
  });

  describe('setPaymentError', () => {
    it('should set error and stop processing', () => {
      const stateProcessing = { ...initialState, isProcessing: true };
      const nextState = paymentReducer(stateProcessing, setPaymentError('Payment declined'));
      expect(nextState.error).toBe('Payment declined');
      expect(nextState.isProcessing).toBe(false);
    });

    it('should clear error when null', () => {
      const stateWithError = { ...initialState, error: 'Some error' };
      const nextState = paymentReducer(stateWithError, setPaymentError(null));
      expect(nextState.error).toBeNull();
    });
  });

  describe('resetPayment', () => {
    it('should reset to initial state', () => {
      const modifiedState = {
        card: { number: '4242', cvc: '123', exp_month: '12', exp_year: '28', card_holder: 'OSO' },
        baseFee: 5000,
        deliveryFee: 10000,
        totalAmount: 15000,
        isProcessing: true,
        error: 'Error',
      };
      const nextState = paymentReducer(modifiedState, resetPayment());
      expect(nextState).toEqual(initialState);
    });
  });
});