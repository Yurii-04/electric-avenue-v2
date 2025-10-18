import { ApiProperty } from '@nestjs/swagger';

class ProductImageDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  publicId: string;

  @ApiProperty()
  createdAt: Date;
}

export class ProductResponseWithImagesDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sellerId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [ProductImageDto] })
  productImages: ProductImageDto[];
}
