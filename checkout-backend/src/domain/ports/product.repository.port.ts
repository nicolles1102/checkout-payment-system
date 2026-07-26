export interface ProductRepositoryPort {
  findAll(): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  updateStock(id: string, newStock: number): Promise<void>;
  seedInitialProduct(): Promise<void>;
}