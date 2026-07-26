import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './infrastructure/adapters/prisma/prisma.service';
import { PrismaProductRepository } from './infrastructure/adapters/prisma/prisma-product.repository';
import { ProductController } from './infrastructure/controllers/product.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [ProductController],
  providers: [PrismaService, PrismaProductRepository],
})
export class AppModule {}