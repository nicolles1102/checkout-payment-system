import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { WompiPort, WompiTransactionResult } from '../../../domain/ports/wompi.port';

@Injectable()
export class WompiAdapter implements WompiPort {
  private readonly baseUrl: string;
  private readonly privateKey: string;
  private readonly integrityKey: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('WOMPI_BASE_URL')!;
    this.privateKey = this.configService.get<string>('WOMPI_PRIVATE_KEY')!;
    this.integrityKey = this.configService.get<string>('WOMPI_INTEGRITY_KEY')!;
  }

  private mapWompiStatus(wompiStatus: string): WompiTransactionResult['status'] {
    if (wompiStatus === 'APPROVED') return 'APPROVED';
    if (wompiStatus === 'DECLINED') return 'DECLINED';
    if (wompiStatus === 'PENDING') return 'PENDING';
    return 'ERROR';
  }

  async createTransaction(data: {
    amountInCents: number;
    currency: string;
    reference: string;
    token: string;
    acceptanceToken: string;
    customerEmail: string;
    customerFullName: string;
    customerPhoneNumber: string;
  }): Promise<WompiTransactionResult> {
    try {

      const signPayload = `${data.reference}${data.amountInCents}${data.currency}${this.integrityKey}`;
      const signature = createHash('sha256').update(signPayload).digest('hex');

      const body = JSON.stringify({
        amount_in_cents: data.amountInCents,
        currency: data.currency,
        reference: data.reference,
        customer_email: data.customerEmail,
        signature,
        payment_method: {
          type: 'CARD',
          installments: 1,
          token: data.token,
        },
        customer_data: {
          phone_number: data.customerPhoneNumber,
          full_name: data.customerFullName,
        },
        acceptance_token: data.acceptanceToken,
      });
      
      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.privateKey}`,
        },
        body,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Wompi API error:', response.status, errorBody);
        return {
          status: 'ERROR',
          wompiTransactionId: '',
        };
      }

      const result = await response.json();
      const wompiStatus = result.data?.status ?? '';
      return {
        status: this.mapWompiStatus(wompiStatus),
        wompiTransactionId: result.data?.id ?? '',
      };
    } catch (error) {
      console.error('Wompi adapter error:', error);
      return {
        status: 'ERROR',
        wompiTransactionId: '',
      };
    }
  }

  async getTransactionStatus(wompiTransactionId: string): Promise<WompiTransactionResult> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${wompiTransactionId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.privateKey}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Wompi getTransaction error:', response.status, errorBody);
        return {
          status: 'ERROR',
          wompiTransactionId,
        };
      }

      const result = await response.json();
      const wompiStatus = result.data?.status ?? '';
      return {
        status: this.mapWompiStatus(wompiStatus),
        wompiTransactionId: result.data?.id ?? wompiTransactionId,
      };
    } catch (error) {
      console.error('Wompi getTransaction error:', error);
      return {
        status: 'ERROR',
        wompiTransactionId,
      };
    }
  }
}