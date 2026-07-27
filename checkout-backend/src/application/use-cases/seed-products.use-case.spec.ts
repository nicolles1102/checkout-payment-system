import { SeedProductsUseCase } from './seed-products.use-case';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';

describe('SeedProductsUseCase', () => {
  let useCase: SeedProductsUseCase;
  let mockRepo: jest.Mocked<ProductRepositoryPort>;

  beforeEach(() => {
    mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStock: jest.fn(),
      seedInitialProduct: jest.fn(),
    };
    useCase = new SeedProductsUseCase(mockRepo);
  });

  describe('execute', () => {
    it('should seed products successfully', async () => {
      mockRepo.seedInitialProduct.mockResolvedValue(undefined);

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeUndefined();
      expect(mockRepo.seedInitialProduct).toHaveBeenCalledTimes(1);
    });

    it('should return fail when seeding throws an error', async () => {
      const error = new Error('Failed to seed');
      mockRepo.seedInitialProduct.mockRejectedValue(error);

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(error);
    });

    it('should return fail with generic error for non-Error throws', async () => {
      mockRepo.seedInitialProduct.mockRejectedValue('unexpected');

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(false);
      expect(result.error!.message).toBe('Failed to seed products');
    });
  });
});