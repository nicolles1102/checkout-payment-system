import deliveryReducer, { updateCustomer, updateDelivery, setAcceptTerms, resetDelivery } from './deliverySlice';

describe('deliverySlice', () => {
  const initialState = {
    customer: {
      email: '',
      full_name: '',
      phone_number: '',
    },
    delivery: {
      address: '',
      city: '',
      region: '',
      postal_code: '',
    },
    acceptTerms: false,
  };

  describe('updateCustomer', () => {
    it('should update customer fields', () => {
      const nextState = deliveryReducer(initialState, updateCustomer({ full_name: 'Oso Pérez' }));
      expect(nextState.customer.full_name).toBe('Oso Pérez');
    });

    it('should merge partial customer update', () => {
      const stateWithName = {
        ...initialState,
        customer: { email: '', full_name: 'Oso', phone_number: '' },
      };
      const nextState = deliveryReducer(stateWithName, updateCustomer({ email: 'oso@email.com' }));
      expect(nextState.customer.full_name).toBe('Oso');
      expect(nextState.customer.email).toBe('oso@email.com');
    });
  });

  describe('updateDelivery', () => {
    it('should update delivery fields', () => {
      const nextState = deliveryReducer(initialState, updateDelivery({ address: 'Calle 123', city: 'Medellín' }));
      expect(nextState.delivery.address).toBe('Calle 123');
      expect(nextState.delivery.city).toBe('Medellín');
    });

    it('should merge partial delivery update', () => {
      const nextState = deliveryReducer(initialState, updateDelivery({ postal_code: '050001' }));
      expect(nextState.delivery.postal_code).toBe('050001');
    });
  });

  describe('setAcceptTerms', () => {
    it('should set acceptTerms to true', () => {
      const nextState = deliveryReducer(initialState, setAcceptTerms(true));
      expect(nextState.acceptTerms).toBe(true);
    });

    it('should set acceptTerms to false', () => {
      const stateAccepted = { ...initialState, acceptTerms: true };
      const nextState = deliveryReducer(stateAccepted, setAcceptTerms(false));
      expect(nextState.acceptTerms).toBe(false);
    });
  });

  describe('resetDelivery', () => {
    it('should reset to initial state', () => {
      const modifiedState = {
        customer: { email: 'oso@email.com', full_name: 'Oso', phone_number: '+57' },
        delivery: { address: 'Calle 123', city: 'Medellín', region: 'Antioquia', postal_code: '050001' },
        acceptTerms: true,
      };
      const nextState = deliveryReducer(modifiedState, resetDelivery());
      expect(nextState).toEqual(initialState);
    });
  });
});