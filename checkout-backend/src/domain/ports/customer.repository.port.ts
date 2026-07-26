import { Customer } from '../entities/customer.entity';

export interface CustomerRepositoryPort {
  create(data: { email: string; fullName: string; phoneNumber: string }): Promise<Customer>;
  findByEmail(email: string): Promise<Customer | null>;
}