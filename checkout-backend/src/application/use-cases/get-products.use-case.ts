import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { Product } from '../../domain/entities/product.entity';
import { Result } from '../common/result';

export class GetProductsUseCase {
  constructor(private readonly productRepo: ProductRepositoryPort) {}

  async execute(): Promise<Result<Product[], Error>> {
    try {
      const products = await this.productRepo.findAll();
      return Result.ok(products);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Failed to fetch products'));
    }
  }
}