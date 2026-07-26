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
  ) {}

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
  }): Promise<Result<{ transactionId: string; status: string }, Error>> {
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

      // 6. Call Wompi API to process payment
      const paymentResult = await this.wompiPort.createTransaction({
        amountInCents: Math.round(totalAmount * 100),
        currency: 'COP',
        cardNumber: data.cardNumber,
        cvc: data.cvc,
        expMonth: data.expMonth,
        expYear: data.expYear,
        cardHolder: data.cardHolder,
        reference: transaction.id,
      });

      // 7. Update transaction with Wompi result
      const status = paymentResult.status === 'APPROVED' ? 'APPROVED' : 'DECLINED';
      await this.transactionRepo.updateStatus(transaction.id, status, paymentResult.wompiTransactionId);

      // 8. If approved, decrement stock
      if (status === 'APPROVED') {
        await this.productRepo.updateStock(product.id, product.stock - 1);
      }

      return Result.ok({ transactionId: transaction.id, status });
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Payment processing failed'));
    }
  }
}