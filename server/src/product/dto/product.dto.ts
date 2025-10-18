import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDecimal,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { PageOptionsDto } from '~/common/dtos';

export class SearchProductsQueryDto extends PageOptionsDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  query?: string;
}

export class CreateProductDto {
  @ApiProperty({ minLength: 5, maxLength: 50 })
  @IsString()
  @Length(5, 50)
  title: string;

  @ApiProperty({ minLength: 10, maxLength: 500 })
  @IsString()
  @Length(10, 500)
  description: string;

  @ApiProperty({ example: '99.99' })
  @IsDecimal()
  @IsNotEmpty()
  price: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}

export class UpdateProductDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(5, 50)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(10, 500)
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDecimal()
  @IsNotEmpty()
  price?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  categoryId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagesToDelete?: string[];
}
