import { ProductController } from './product.controller';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';
import { SeedProductsUseCase } from '../../application/use-cases/seed-products.use-case';
import { Product } from '../../domain/entities/product.entity';
import { Result } from '../../application/common/result';

describe('ProductController', () => {
  let controller: ProductController;
  let mockGetProductsUseCase: jest.Mocked<GetProductsUseCase>;
  let mockSeedProductsUseCase: jest.Mocked<SeedProductsUseCase>;

  const mockProducts = [
    Product.create({
      id: '1',
      name: 'Chaquetita Oso',
      description: 'Para perritos',
      price: 50000,
      stock: 10,
      imageUrl: null,
      createdAt: new Date(),
    }),
  ];

  beforeEach(() => {
    mockGetProductsUseCase = {
      execute: jest.fn(),
    } as any;

    mockSeedProductsUseCase = {
      execute: jest.fn(),
    } as any;

    controller = new ProductController(mockGetProductsUseCase, mockSeedProductsUseCase);
  });

  describe('onModuleInit', () => {
    it('should seed products on module init', async () => {
      mockSeedProductsUseCase.execute.mockResolvedValue(Result.ok(undefined));

      await controller.onModuleInit();

      expect(mockSeedProductsUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProducts', () => {
    it('should return products successfully', async () => {
      mockGetProductsUseCase.execute.mockResolvedValue(Result.ok(mockProducts));

      const result = await controller.getProducts();

      expect(result).toEqual({ success: true, data: mockProducts });
    });

    it('should return error when use case fails', async () => {
      mockGetProductsUseCase.execute.mockResolvedValue(
        Result.fail(new Error('Database error')),
      );

      const result = await controller.getProducts();

      expect(result).toEqual({ success: false, error: 'Database error' });
    });

    it('should return unknown error message when error has no message', async () => {
      mockGetProductsUseCase.execute.mockResolvedValue(
        Result.fail(new Error()),
      );

      const result = await controller.getProducts();

      expect(result).toEqual({ success: false, error: 'Unknown error' });
    });

    it('should return empty array when no products', async () => {
      mockGetProductsUseCase.execute.mockResolvedValue(Result.ok([]));

      const result = await controller.getProducts();

      expect(result).toEqual({ success: true, data: [] });
    });
  });
});