export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly stock: number,
    public readonly imageUrl: string | null,
    public readonly createdAt: Date | null,
  ) {}

  static create(props: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string | null;
    createdAt: Date | null;
  }): Product {
    return new Product(
      props.id,
      props.name,
      props.description,
      props.price,
      props.stock,
      props.imageUrl,
      props.createdAt,
    );
  }
}