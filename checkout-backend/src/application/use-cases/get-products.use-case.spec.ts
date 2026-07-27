import { GetProductsUseCase } from './get-products.use-case';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { Product } from '../../domain/entities/product.entity';

describe('GetProductsUseCase', () => {
  let useCase: GetProductsUseCase;
  let mockRepo: jest.Mocked<ProductRepositoryPort>;

  const mockProducts = [
    Product.create({
      id: '1',
      name: 'Product 1',
      description: 'Description 1',
      price: 10000,
      stock: 5,
      imageUrl: null,
      createdAt: new Date(),
    }),
    Product.create({
      id: '2',
      name: 'Product 2',
      description: 'Description 2',
      price: 20000,
      stock: 10,
      imageUrl: 'http://example.com/img.jpg',
      createdAt: new Date(),
    }),
  ];

  beforeEach(() => {
    mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStock: jest.fn(),
      seedInitialProduct: jest.fn(),
    };
    useCase = new GetProductsUseCase(mockRepo);
  });

  describe('execute', () => {
    it('should return all products successfully', async () => {
      mockRepo.findAll.mockResolvedValue(mockProducts);

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockProducts);
      expect(result.value).toHaveLength(2);
      expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no products exist', async () => {
      mockRepo.findAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual([]);
    });

    it('should return fail when repository throws', async () => {
      const error = new Error('Database connection failed');
      mockRepo.findAll.mockRejectedValue(error);

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(error);
    });

    it('should return fail with generic error for non-Error throws', async () => {
      mockRepo.findAll.mockRejectedValue('string error');

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error!.message).toBe('Failed to fetch products');
    });

    it('should return products with correct properties', async () => {
      mockRepo.findAll.mockResolvedValue(mockProducts);

      const result = await useCase.execute();
      const product = result.value![0];

      expect(product.id).toBe('1');
      expect(product.name).toBe('Product 1');
      expect(product.price).toBe(10000);
      expect(product.stock).toBe(5);
    });
  });
});