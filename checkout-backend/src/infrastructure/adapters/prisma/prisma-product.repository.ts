import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ProductRepositoryPort } from '../../../domain/ports/product.repository.port';

@Injectable()
export class PrismaProductRepository implements ProductRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.products.findMany();
  }

  async findById(id: string) {
    return this.prisma.products.findUnique({ where: { id } });
  }

  async updateStock(id: string, newStock: number) {
    await this.prisma.products.update({
      where: { id },
      data: { stock: newStock },
    });
  }

  async seedInitialProduct() {
    const count = await this.prisma.products.count();
    if (count === 0) {
      await this.prisma.products.create({
        data: {
          name: 'Chaqueta Oso de Peluche Oversize',
          description: 'Chaqueta de textura suave estilo peluche, corte oversize con cierre frontal.',
          price: 150000,
          stock: 10,
          image_url: '/images/oso-jacket.jpg',
        },
      });
    }
  }
}