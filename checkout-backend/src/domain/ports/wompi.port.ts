export interface WompiTransactionResult {
  status: 'APPROVED' | 'DECLINED' | 'PENDING' | 'ERROR';
  wompiTransactionId: string;
}

export interface WompiPort {
  createTransaction(data: {
    amountInCents: number;
    currency: string;
    reference: string;
    token: string;
    acceptanceToken: string;
    customerEmail: string;
    customerFullName: string;
    customerPhoneNumber: string;
  }): Promise<WompiTransactionResult>;

  getTransactionStatus(wompiTransactionId: string): Promise<WompiTransactionResult>;
}