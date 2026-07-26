import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { DeliveryRepositoryPort } from '../../../domain/ports/delivery.repository.port';
import { Delivery } from '../../../domain/entities/delivery.entity';

@Injectable()
export class PrismaDeliveryRepository implements DeliveryRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { address: string; city: string; region: string; postalCode?: string }): Promise<Delivery> {
    const delivery = await this.prisma.deliveries.create({
      data: {
        address: data.address,
        city: data.city,
        region: data.region,
        postal_code: data.postalCode ?? null,
      },
    });
    return new Delivery(
      delivery.id,
      delivery.address,
      delivery.city,
      delivery.region,
      delivery.postal_code,
      delivery.status,
      delivery.created_at,
    );
  }
}