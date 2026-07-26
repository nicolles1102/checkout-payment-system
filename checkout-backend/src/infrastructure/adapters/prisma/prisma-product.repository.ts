import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ProductRepositoryPort } from '../../../domain/ports/product.repository.port';
import { Product } from '../../../domain/entities/product.entity';

@Injectable()
export class PrismaProductRepository implements ProductRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    const products = await this.prisma.products.findMany();
    return products.map(
      (p) =>
        new Product(
          p.id,
          p.name,
          p.description,
          Number(p.price),
          p.stock,
          p.image_url,
          p.created_at,
        ),
    );
  }

  async findById(id: string): Promise<Product | null> {
    const p = await this.prisma.products.findUnique({ where: { id } });
    if (!p) return null;
    return new Product(
      p.id,
      p.name,
      p.description,
      Number(p.price),
      p.stock,
      p.image_url,
      p.created_at,
    );
  }

  async updateStock(id: string, newStock: number): Promise<void> {
    await this.prisma.products.update({
      where: { id },
      data: { stock: newStock },
    });
  }

  async seedInitialProduct(): Promise<void> {
    const count = await this.prisma.products.count();
    if (count === 0) {
      await this.prisma.products.create({
        data: {
          name: 'Chaqueta Oso de Peluche Oversize',
          description:
            'Chaqueta de textura suave estilo peluche, corte oversize con cierre frontal.',
          price: 150000,
          stock: 10,
          image_url: '/images/oso-jacket.jpg',
        },
      });
    }
  }
}