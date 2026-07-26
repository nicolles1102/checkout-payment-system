import { ConfigService } from '@nestjs/config';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { CustomerRepositoryPort } from '../../domain/ports/customer.repository.port';
import { DeliveryRepositoryPort } from '../../domain/ports/delivery.repository.port';
import { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { WompiPort } from '../../domain/ports/wompi.port';
import { Result } from '../common/result';

const BASE_FEE = 3000;
const DELIVERY_FEE = 7000;

export class CreatePaymentUseCase {
  constructor(
    private readonly productRepo: ProductRepositoryPort,
    private readonly customerRepo: CustomerRepositoryPort,
    private readonly deliveryRepo: DeliveryRepositoryPort,
    private readonly transactionRepo: TransactionRepositoryPort,
    private readonly wompiPort: WompiPort,
    private readonly configService: ConfigService,
  ) {}

  private async getAcceptanceToken(): Promise<string> {
    const publicKey = this.configService.get<string>('WOMPI_PUBLIC_KEY')!;
    const baseUrl = this.configService.get<string>('WOMPI_BASE_URL')!;

    const response = await fetch(`${baseUrl}/merchants/${publicKey}`);
    const body = await response.json();
    return body.data?.presigned_acceptance?.acceptance_token ?? '';
  }

  private async tokenizeCard(data: {
    cardNumber: string;
    cvc: string;
    expMonth: string;
    expYear: string;
    cardHolder: string;
  }): Promise<string> {
    const publicKey = this.configService.get<string>('WOMPI_PUBLIC_KEY')!;
    const baseUrl = this.configService.get<string>('WOMPI_BASE_URL')!;

    // Wompi requires card_holder min 5 characters
    const cardHolder = data.cardHolder.trim();
    if (cardHolder.length < 5) {
      throw new Error('Card holder name must be at least 5 characters');
    }

    // Wompi expects 2-digit year (e.g. "28") for exp_year
    const expYear = data.expYear.length === 4 ? data.expYear.slice(2) : data.expYear;

    const response = await fetch(`${baseUrl}/tokens/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicKey}`,
      },
      body: JSON.stringify({
        number: data.cardNumber,
        cvc: data.cvc,
        exp_month: data.expMonth.padStart(2, '0'),
        exp_year: expYear.padStart(2, '0'),
        card_holder: cardHolder,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Card tokenization failed: ${errorBody}`);
    }

    const result = await response.json();
    return result.data?.id ?? '';
  }

  async execute(data: {
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
  }): Promise<Result<{
    transaction: {
      id: string;
      amount: number;
      base_fee: number;
      delivery_fee: number;
      status: string;
      wompi_transaction_id: string;
    };
    status: string;
  }, Error>> {
    try {
      // 1. Validate product exists and has stock
      const product = await this.productRepo.findById(data.productId);
      if (!product) return Result.fail(new Error('Product not found'));
      if (product.stock <= 0) return Result.fail(new Error('Product out of stock'));

      // 2. Find or create customer
      let customer = await this.customerRepo.findByEmail(data.email);
      if (!customer) {
        customer = await this.customerRepo.create({
          email: data.email,
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
        });
      }

      // 3. Create delivery
      const delivery = await this.deliveryRepo.create({
        address: data.address,
        city: data.city,
        region: data.region,
        postalCode: data.postalCode,
      });

      // 4. Calculate totals
      const amount = product.price;
      const totalAmount = amount + BASE_FEE + DELIVERY_FEE;

      // 5. Create transaction in PENDING status
      const transaction = await this.transactionRepo.create({
        amount: totalAmount,
        baseFee: BASE_FEE,
        deliveryFee: DELIVERY_FEE,
        productId: product.id,
        customerId: customer.id,
        deliveryId: delivery.id,
      });

      // 6. Get acceptance token from Wompi
      const acceptanceToken = await this.getAcceptanceToken();

      // 7. Tokenize card using Wompi tokenization API
      // Strip spaces from card number (Wompi expects digits only)
      const cleanCardNumber = data.cardNumber.replace(/\s/g, '');
      const token = await this.tokenizeCard({
        cardNumber: cleanCardNumber,
        cvc: data.cvc,
        expMonth: data.expMonth,
        expYear: data.expYear,
        cardHolder: data.cardHolder,
      });

      // 8. Call Wompi API to process payment
      const paymentResult = await this.wompiPort.createTransaction({
        amountInCents: Math.round(totalAmount * 100),
        currency: 'COP',
        reference: transaction.id,
        token: token,
        acceptanceToken,
        customerEmail: data.email,
        customerFullName: data.fullName,
        customerPhoneNumber: data.phoneNumber,
      });

      // 8. Update transaction with Wompi result
      const status = paymentResult.status === 'APPROVED' ? 'APPROVED' : paymentResult.status === 'DECLINED' ? 'DECLINED' : paymentResult.status === 'PENDING' ? 'PENDING' : 'ERROR';
      await this.transactionRepo.updateStatus(transaction.id, status, paymentResult.wompiTransactionId);

      // 9. If approved, decrement stock
      if (status === 'APPROVED') {
        await this.productRepo.updateStock(product.id, product.stock - 1);
      }

      return Result.ok({
        transaction: {
          id: transaction.id,
          amount: totalAmount,
          base_fee: BASE_FEE,
          delivery_fee: DELIVERY_FEE,
          status: status,
          wompi_transaction_id: paymentResult.wompiTransactionId,
        },
        status: status,
      });
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Payment processing failed'));
    }
  }
}
