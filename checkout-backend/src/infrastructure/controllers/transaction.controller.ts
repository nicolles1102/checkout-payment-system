import { Controller, Post, Get, Param, Body, Inject } from '@nestjs/common';
import { CreatePaymentUseCase } from '../../application/use-cases/create-payment.use-case';
import { CheckTransactionStatusUseCase } from '../../application/use-cases/check-transaction-status.use-case';

@Controller('transactions')
export class TransactionController {
  constructor(
    @Inject(CreatePaymentUseCase)
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    @Inject(CheckTransactionStatusUseCase)
    private readonly checkTransactionStatusUseCase: CheckTransactionStatusUseCase,
  ) {}

  @Post()
  async createTransaction(
    @Body()
    body: {
      items: { productId: string; quantity: number }[];
      email: string;
      fullName: string;
      phoneNumber: string;
      address: string;
      city: string;
      region: string;
      postalCode?: string;
      cardNumber: string;
      cvc: string;
      expMonth: string;
      expYear: string;
      cardHolder: string;
    },
  ) {
    const result = await this.createPaymentUseCase.execute(body);
    if (!result.isSuccess) {
      return { success: false, error: result.error?.message || 'Payment failed' };
    }
    return { success: true, data: result.value };
  }

  @Get(':id')
  async getTransaction(@Param('id') id: string) {
    const result = await this.checkTransactionStatusUseCase.execute(id);
    if (!result.isSuccess) {
      return { success: false, error: result.error?.message || 'Transaction not found' };
    }
    return { success: true, data: result.value };
  }
}
