export class Customer {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly fullName: string,
    public readonly phoneNumber: string,
    public readonly createdAt: Date | null,
  ) {}
}