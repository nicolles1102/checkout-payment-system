import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CustomerRepositoryPort } from '../../../domain/ports/customer.repository.port';
import { Customer } from '../../../domain/entities/customer.entity';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { email: string; fullName: string; phoneNumber: string }): Promise<Customer> {
    const customer = await this.prisma.customers.create({
      data: {
        email: data.email,
        full_name: data.fullName,
        phone_number: data.phoneNumber,
      },
    });
    return new Customer(customer.id, customer.email, customer.full_name, customer.phone_number, customer.created_at);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const customer = await this.prisma.customers.findUnique({ where: { email } });
    if (!customer) return null;
    return new Customer(customer.id, customer.email, customer.full_name, customer.phone_number, customer.created_at);
  }
}