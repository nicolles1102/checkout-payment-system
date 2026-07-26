import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { Result } from '../common/result';

export class SeedProductsUseCase {
  constructor(private readonly productRepo: ProductRepositoryPort) {}

  async execute(): Promise<Result<void, Error>> {
    try {
      await this.productRepo.seedInitialProduct();
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Failed to seed products'));
    }
  }
}