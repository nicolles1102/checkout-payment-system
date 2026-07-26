import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WompiPort, WompiTransactionResult } from '../../../domain/ports/wompi.port';

@Injectable()
export class WompiAdapter implements WompiPort {
  private readonly baseUrl: string;
  private readonly privateKey: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('WOMPI_BASE_URL')!;
    this.privateKey = this.configService.get<string>('WOMPI_PRIVATE_KEY')!;
  }

  async createTransaction(data: {
    amountInCents: number;
    currency: string;
    cardNumber: string;
    cvc: string;
    expMonth: string;
    expYear: string;
    cardHolder: string;
    reference: string;
  }): Promise<WompiTransactionResult> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.privateKey}`,
        },
        body: JSON.stringify({
          amount_in_cents: data.amountInCents,
          currency: data.currency,
          reference: data.reference,
          payment_method: {
            type: 'CARD',
            installments: 1,
            token: null,
            payment_source_id: null,
          },
          customer_data: {
            phone_number: '',
            full_name: data.cardHolder,
          },
          acceptance_token: null,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        return {
          status: 'ERROR',
          wompiTransactionId: '',
        };
      }

      const result = await response.json();
      return {
        status: result.data?.status === 'APPROVED' ? 'APPROVED' : 'DECLINED',
        wompiTransactionId: result.data?.id ?? '',
      };
    } catch (error) {
      return {
        status: 'ERROR',
        wompiTransactionId: '',
      };
    }
  }
}