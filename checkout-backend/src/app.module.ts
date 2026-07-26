import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from './infrastructure/adapters/prisma/prisma.service';
import { PrismaProductRepository } from './infrastructure/adapters/prisma/prisma-product.repository';
import { PrismaCustomerRepository } from './infrastructure/adapters/prisma/prisma-customer.repository';
import { PrismaDeliveryRepository } from './infrastructure/adapters/prisma/prisma-delivery.repository';
import { PrismaTransactionRepository } from './infrastructure/adapters/prisma/prisma-transaction.repository';
import { WompiAdapter } from './infrastructure/adapters/wompi/wompi.adapter';
import { ProductController } from './infrastructure/controllers/product.controller';
import { TransactionController } from './infrastructure/controllers/transaction.controller';
import { GetProductsUseCase } from './application/use-cases/get-products.use-case';
import { SeedProductsUseCase } from './application/use-cases/seed-products.use-case';
import { CreatePaymentUseCase } from './application/use-cases/create-payment.use-case';
import { CheckTransactionStatusUseCase } from './application/use-cases/check-transaction-status.use-case';

const PRODUCT_REPO = 'ProductRepository';
const CUSTOMER_REPO = 'CustomerRepository';
const DELIVERY_REPO = 'DeliveryRepository';
const TRANSACTION_REPO = 'TransactionRepository';
const WOMPI_PORT = 'WompiPort';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [ProductController, TransactionController],
  providers: [
    PrismaService,
    { provide: PRODUCT_REPO, useClass: PrismaProductRepository },
    { provide: CUSTOMER_REPO, useClass: PrismaCustomerRepository },
    { provide: DELIVERY_REPO, useClass: PrismaDeliveryRepository },
    { provide: TRANSACTION_REPO, useClass: PrismaTransactionRepository },
    { provide: WOMPI_PORT, useClass: WompiAdapter },
    {
      provide: GetProductsUseCase,
      useFactory: (repo: PrismaProductRepository) => new GetProductsUseCase(repo),
      inject: [PRODUCT_REPO],
    },
    {
      provide: SeedProductsUseCase,
      useFactory: (repo: PrismaProductRepository) => new SeedProductsUseCase(repo),
      inject: [PRODUCT_REPO],
    },
    {
      provide: CreatePaymentUseCase,
      useFactory: (
        productRepo: PrismaProductRepository,
        customerRepo: PrismaCustomerRepository,
        deliveryRepo: PrismaDeliveryRepository,
        transactionRepo: PrismaTransactionRepository,
        wompiPort: WompiAdapter,
        configService: ConfigService,
      ) => new CreatePaymentUseCase(productRepo, customerRepo, deliveryRepo, transactionRepo, wompiPort, configService),
      inject: [PRODUCT_REPO, CUSTOMER_REPO, DELIVERY_REPO, TRANSACTION_REPO, WOMPI_PORT, ConfigService],
    },
    {
      provide: CheckTransactionStatusUseCase,
      useFactory: (
        transactionRepo: PrismaTransactionRepository,
        wompiPort: WompiAdapter,
      ) => new CheckTransactionStatusUseCase(transactionRepo, wompiPort),
      inject: [TRANSACTION_REPO, WOMPI_PORT],
    },
  ],
})
export class AppModule {}
