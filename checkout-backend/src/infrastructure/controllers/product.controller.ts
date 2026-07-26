import { Controller, Get, Inject, OnModuleInit } from '@nestjs/common';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';
import { SeedProductsUseCase } from '../../application/use-cases/seed-products.use-case';

@Controller('products')
export class ProductController implements OnModuleInit {
  constructor(
    @Inject(GetProductsUseCase)
    private readonly getProductsUseCase: GetProductsUseCase,
    @Inject(SeedProductsUseCase)
    private readonly seedProductsUseCase: SeedProductsUseCase,
  ) {}

  async onModuleInit() {
    await this.seedProductsUseCase.execute();
  }

  @Get()
  async getProducts() {
    const result = await this.getProductsUseCase.execute();
    if (!result.isSuccess) {
      return { success: false, error: result.error?.message ?? 'Unknown error' };
    }
    return { success: true, data: result.value };
  }
}
