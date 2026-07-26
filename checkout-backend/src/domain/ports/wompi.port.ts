export interface WompiTransactionResult {
  status: 'APPROVED' | 'DECLINED' | 'ERROR';
  wompiTransactionId: string;
}

export interface WompiPort {
  createTransaction(data: {
    amountInCents: number;
    currency: string;
    cardNumber: string;
    cvc: string;
    expMonth: string;
    expYear: string;
    cardHolder: string;
    reference: string;
  }): Promise<WompiTransactionResult>;
}