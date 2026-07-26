import { Controller, Post, Get, Param, Body, Inject } from '@nestjs/common';
import { CreatePaymentUseCase } from '../../application/use-cases/create-payment.use-case';

@Controller('transactions')
export class TransactionController {
  constructor(
    @Inject(CreatePaymentUseCase)
    private readonly createPaymentUseCase: CreatePaymentUseCase,
  ) {}

  @Post()
  async createTransaction(
    @Body()
    body: {
      productId: string;
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
      return { success: false, error: result.error?.message ?? 'Payment failed' };
    }
    return { success: true, data: result.value };
  }

  @Get(':id')
  async getTransaction(@Param('id') id: string) {
    return { success: true, data: { id } };
  }
}