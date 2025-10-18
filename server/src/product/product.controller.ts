import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { GetCurrentUserId } from '~/common/decorators/get-user-id.decorator';
import { Public } from '~/common/decorators/public.decorator';
import { PageDto } from '~/common/dtos';
import { RequiredFilesPipe } from '~/common/pipes';
import {
  CreateProductDto,
  SearchProductsQueryDto,
  UpdateProductDto,
} from '~/product/dto/product.dto';
import { ProductResponseWithImagesDto } from '~/product/dto/product.response-dto';
import { ProductService } from './product.service';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiCreatedResponse({ type: ProductResponseWithImagesDto })
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  @Post()
  async create(
    @Body() dto: CreateProductDto,
    @GetCurrentUserId() userId: string,
    @UploadedFiles(new RequiredFilesPipe()) files: Express.Multer.File[],
  ) {
    return this.productService.create(dto, userId, files);
  }

  @Public()
  @ApiOkResponse({ type: PageDto })
  @Get('/search')
  async searchProducts(@Query() query: SearchProductsQueryDto) {
    return this.productService.searchProducts(query, query.query);
  }

  @Public()
  @Get('/:id')
  async getById(@Param('id') productId: string) {
    return this.productService.getById(productId);
  }

  @Delete('/:id')
  async deleteProduct(
    @Param('id') productId: string,
    @GetCurrentUserId() userId: string,
  ) {
    return this.productService.deleteProduct(productId, userId);
  }

  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async updateProduct(
    @Param('id') productId: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetCurrentUserId() userId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productService.updateProduct(
      updateProductDto,
      productId,
      userId,
      files,
    );
  }
}
