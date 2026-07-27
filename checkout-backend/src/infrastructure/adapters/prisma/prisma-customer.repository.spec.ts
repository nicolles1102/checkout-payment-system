import { PrismaCustomerRepository } from './prisma-customer.repository';
import { Customer } from '../../../domain/entities/customer.entity';

describe('PrismaCustomerRepository', () => {
  let repository: PrismaCustomerRepository;
  let mockPrisma: any;

  const mockCustomerRecord = {
    id: 'cust-1',
    email: 'oso@email.com',
    full_name: 'Oso Pérez',
    phone_number: '+573001234567',
    created_at: new Date(),
  };

  beforeEach(() => {
    mockPrisma = {
      customers: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    repository = new PrismaCustomerRepository(mockPrisma);
  });

  describe('create', () => {
    it('should create a customer and return domain entity', async () => {
      mockPrisma.customers.create.mockResolvedValue(mockCustomerRecord);

      const result = await repository.create({
        email: 'oso@email.com',
        fullName: 'Oso Pérez',
        phoneNumber: '+573001234567',
      });

      expect(result).toBeInstanceOf(Customer);
      expect(result.id).toBe('cust-1');
      expect(result.email).toBe('oso@email.com');
      expect(result.fullName).toBe('Oso Pérez');
      expect(result.phoneNumber).toBe('+573001234567');
      expect(mockPrisma.customers.create).toHaveBeenCalledWith({
        data: {
          email: 'oso@email.com',
          full_name: 'Oso Pérez',
          phone_number: '+573001234567',
        },
      });
    });

    it('should map all fields correctly', async () => {
      mockPrisma.customers.create.mockResolvedValue(mockCustomerRecord);

      const result = await repository.create({
        email: 'oso@email.com',
        fullName: 'Oso Pérez',
        phoneNumber: '+573001234567',
      });

      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('findByEmail', () => {
    it('should return customer when email exists', async () => {
      mockPrisma.customers.findUnique.mockResolvedValue(mockCustomerRecord);

      const result = await repository.findByEmail('oso@email.com');

      expect(result).toBeInstanceOf(Customer);
      expect(result?.id).toBe('cust-1');
      expect(result?.email).toBe('oso@email.com');
      expect(mockPrisma.customers.findUnique).toHaveBeenCalledWith({
        where: { email: 'oso@email.com' },
      });
    });

    it('should return null when email not found', async () => {
      mockPrisma.customers.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('unknown@email.com');

      expect(result).toBeNull();
    });
  });
});