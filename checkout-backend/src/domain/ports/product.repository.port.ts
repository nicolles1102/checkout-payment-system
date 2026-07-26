import { Product } from '../entities/product.entity';

export interface ProductRepositoryPort {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  updateStock(id: string, newStock: number): Promise<void>;
  seedInitialProduct(): Promise<void>;
}