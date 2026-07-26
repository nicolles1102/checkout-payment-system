import type {
  Product,
  CreateTransactionPayload,
  TransactionResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  const body: ApiResponse<T> = await res.json().catch(() => ({
    success: false,
    error: res.statusText,
  }));

  if (!res.ok || !body.success) {
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return body.data as T;
}

export const api = {
  getProducts: () => request<Product[]>('/products'),

  getProduct: (id: string) => request<Product>(`/products/${id}`),

  getWompiAcceptanceToken: async (): Promise<string> => {
    const publicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY;
    const baseUrl = import.meta.env.VITE_WOMPI_BASE_URL;
    if (!baseUrl) {
      console.warn('VITE_WOMPI_BASE_URL not set, acceptance token may fail');
      return '';
    }
    const res = await fetch(`${baseUrl}/merchants/${publicKey}`);
    const body = await res.json();
    return body.data?.presigned_acceptance?.acceptance_token ?? '';
  },

  createTransaction: (payload: CreateTransactionPayload) => {
    // Map frontend payload to backend expected shape
    const backendPayload = {
      productId: payload.product_id,
      email: payload.customer.email,
      fullName: payload.customer.full_name,
      phoneNumber: payload.customer.phone_number,
      address: payload.delivery.address,
      city: payload.delivery.city,
      region: payload.delivery.region,
      postalCode: payload.delivery.postal_code,
      cardNumber: payload.card.number,
      cvc: payload.card.cvc,
      expMonth: payload.card.exp_month,
      expYear: payload.card.exp_year,
      cardHolder: payload.card.card_holder,
    };

    return request<TransactionResponse>('/transactions', {
      method: 'POST',
      body: JSON.stringify(backendPayload),
    });
  },

  getTransaction: (id: string) =>
    request<TransactionResponse>(`/transactions/${id}`),
};
