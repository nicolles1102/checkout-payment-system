import { PrismaDeliveryRepository } from './prisma-delivery.repository';
import { Delivery } from '../../../domain/entities/delivery.entity';

describe('PrismaDeliveryRepository', () => {
  let repository: PrismaDeliveryRepository;
  let mockPrisma: any;

  const mockDeliveryRecord = {
    id: 'del-1',
    address: 'Calle 123',
    city: 'Medellín',
    region: 'Antioquia',
    postal_code: '050001',
    status: 'PENDING',
    created_at: new Date(),
  };

  beforeEach(() => {
    mockPrisma = {
      deliveries: {
        create: jest.fn(),
      },
    };
    repository = new PrismaDeliveryRepository(mockPrisma);
  });

  describe('create', () => {
    it('should create delivery with all fields and return domain entity', async () => {
      mockPrisma.deliveries.create.mockResolvedValue(mockDeliveryRecord);

      const result = await repository.create({
        address: 'Calle 123',
        city: 'Medellín',
        region: 'Antioquia',
        postalCode: '050001',
      });

      expect(result).toBeInstanceOf(Delivery);
      expect(result.id).toBe('del-1');
      expect(result.address).toBe('Calle 123');
      expect(result.city).toBe('Medellín');
      expect(result.region).toBe('Antioquia');
      expect(result.postalCode).toBe('050001');
      expect(result.status).toBe('PENDING');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(mockPrisma.deliveries.create).toHaveBeenCalledWith({
        data: {
          address: 'Calle 123',
          city: 'Medellín',
          region: 'Antioquia',
          postal_code: '050001',
        },
      });
    });

    it('should create delivery without postal code', async () => {
      const recordWithoutPostal = { ...mockDeliveryRecord, postal_code: null };
      mockPrisma.deliveries.create.mockResolvedValue(recordWithoutPostal);

      const result = await repository.create({
        address: 'Calle 123',
        city: 'Medellín',
        region: 'Antioquia',
      });

      expect(result).toBeInstanceOf(Delivery);
      expect(result.postalCode).toBeNull();
      expect(mockPrisma.deliveries.create).toHaveBeenCalledWith({
        data: {
          address: 'Calle 123',
          city: 'Medellín',
          region: 'Antioquia',
          postal_code: null,
        },
      });
    });
  });
});