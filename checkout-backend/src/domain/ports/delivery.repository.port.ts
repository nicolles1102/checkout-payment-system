import { Delivery } from '../entities/delivery.entity';

export interface DeliveryRepositoryPort {
  create(data: {
    address: string;
    city: string;
    region: string;
    postalCode?: string;
  }): Promise<Delivery>;
}