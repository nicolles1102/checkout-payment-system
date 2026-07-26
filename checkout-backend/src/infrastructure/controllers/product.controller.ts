import { Controller, Get, OnModuleInit } from '@nestjs/common';
import { PrismaProductRepository } from '../adapters/prisma/prisma-product.repository';

@Controller('products')
export class ProductController implements OnModuleInit {
  constructor(private readonly productRepo: PrismaProductRepository) {}

  async onModuleInit() {
    await this.productRepo.seedInitialProduct();
  }

  @Get()
  async getProducts() {
    const products = await this.productRepo.findAll();
    return { success: true, data: products };
  }
}