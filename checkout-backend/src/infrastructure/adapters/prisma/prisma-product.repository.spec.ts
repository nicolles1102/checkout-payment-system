import { PrismaProductRepository } from './prisma-product.repository';
import { Product } from '../../../domain/entities/product.entity';

describe('PrismaProductRepository', () => {
  let repository: PrismaProductRepository;
  let mockPrisma: any;

  const mockProducts = [
    {
      id: 'prod-1',
      name: 'Chaqueta Oso',
      description: 'Chaqueta suave',
      price: 150000,
      stock: 10,
      image_url: 'http://example.com/img.jpg',
      created_at: new Date(),
    },
    {
      id: 'prod-2',
      name: 'Chaqueta Luna',
      description: 'Chaqueta para gatos',
      price: 120000,
      stock: 5,
      image_url: null,
      created_at: new Date(),
    },
  ];

  beforeEach(() => {
    mockPrisma = {
      products: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
      },
    };
    repository = new PrismaProductRepository(mockPrisma);
  });

  describe('findAll', () => {
    it('should return all products mapped to domain entities', async () => {
      mockPrisma.products.findMany.mockResolvedValue(mockProducts);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Product);
      expect(result[0].id).toBe('prod-1');
      expect(result[0].name).toBe('Chaqueta Oso');
      expect(result[0].price).toBe(150000);
      expect(result[1].price).toBe(120000);
    });

    it('should return empty array when no products', async () => {
      mockPrisma.products.findMany.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return product when found', async () => {
      mockPrisma.products.findUnique.mockResolvedValue(mockProducts[0]);

      const result = await repository.findById('prod-1');

      expect(result).toBeInstanceOf(Product);
      expect(result?.id).toBe('prod-1');
      expect(result?.name).toBe('Chaqueta Oso');
      expect(mockPrisma.products.findUnique).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
      });
    });

    it('should return null when product not found', async () => {
      mockPrisma.products.findUnique.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });

    it('should map Decimal price to number correctly', async () => {
      const productWithDecimal = {
        ...mockProducts[0],
        price: 149990.50,
      };
      mockPrisma.products.findUnique.mockResolvedValue(productWithDecimal);

      const result = await repository.findById('prod-1');

      expect(result?.price).toBe(149990.50);
    });
  });

  describe('updateStock', () => {
    it('should update product stock', async () => {
      mockPrisma.products.update.mockResolvedValue({});

      await repository.updateStock('prod-1', 5);

      expect(mockPrisma.products.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { stock: 5 },
      });
    });
  });

  describe('seedInitialProduct', () => {
    it('should create product when no products exist', async () => {
      mockPrisma.products.count.mockResolvedValue(0);
      mockPrisma.products.create.mockResolvedValue(mockProducts[0]);

      await repository.seedInitialProduct();

      expect(mockPrisma.products.count).toHaveBeenCalled();
      expect(mockPrisma.products.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: expect.stringContaining('Oso'),
            price: 150000,
            stock: 10,
          }),
        }),
      );
    });

    it('should NOT create product when products already exist', async () => {
      mockPrisma.products.count.mockResolvedValue(5);

      await repository.seedInitialProduct();

      expect(mockPrisma.products.count).toHaveBeenCalled();
      expect(mockPrisma.products.create).not.toHaveBeenCalled();
    });
  });
});