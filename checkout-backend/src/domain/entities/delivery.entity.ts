export class Delivery {
  constructor(
    public readonly id: string,
    public readonly address: string,
    public readonly city: string,
    public readonly region: string,
    public readonly postalCode: string | null,
    public readonly status: string | null,
    public readonly createdAt: Date | null,
  ) {}
}