import {
  BadGatewayException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { CloudinaryService } from '~/cloudinary/cloudinary.service';
import { PageDto, PageMetaDto, PageOptionsDto } from '~/common/dtos';
import { PrismaService } from '~/prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from '~/product/dto/product.dto';
import { Image } from '~/product/types/product.types';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    dto: CreateProductDto,
    currentUserId: string,
    files: Express.Multer.File[],
  ): Promise<Product> {
    await this.validateCategory(dto.categoryId);
    const uploadedImages = await this.cloudinaryService
      .uploadImages(files)
      .catch(() => {
        throw new BadGatewayException('Failed to load images');
      });

    return this.prisma
      .$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            ...dto,
            sellerId: currentUserId,
          },
        });

        await tx.productImage.createMany({
          data: uploadedImages.map((img) => ({
            url: img.url,
            publicId: img.publicId,
            productId: product.id,
          })),
        });

        return product;
      })
      .then((product) => this.getById(product.id))
      .catch(() => {
        void this.cleanupImages(uploadedImages.map((img) => img.publicId));
        throw new InternalServerErrorException('Failed to create product');
      });
  }

  async getById(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { productImages: true },
    });

    if (!product) throw new NotFoundException();

    return product;
  }

  async searchProducts(
    pageOptionsDto: PageOptionsDto,
    query?: string,
  ): Promise<PageDto<Pick<Product, 'title'>>> {
    const where: Prisma.ProductWhereInput = query
      ? { title: { contains: query, mode: 'insensitive' } }
      : {};

    const { skip, take } = pageOptionsDto;
    const [data, itemCount] = await Promise.all([
      this.prisma.product.groupBy({
        by: ['title'],
        where,
        skip,
        take,
        orderBy: { title: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
    return new PageDto(data, pageMetaDto);
  }

  async deleteProduct(
    productId: string,
    userId: string,
  ): Promise<{ message: string; success: boolean }> {
    const product = await this.validateProductAccess(productId, userId);
    await this.prisma.product.delete({ where: { id: product.id } });
    await this.cleanupImages(product.productImages.map((img) => img.publicId));

    return { success: true, message: 'Product deleted successfully' };
  }

  async updateProduct(
    dto: UpdateProductDto,
    productId: string,
    userId: string,
    files: Express.Multer.File[],
  ): Promise<Product> {
    const product = await this.validateProductAccess(productId, userId);
    const { imagesToDelete = [], categoryId, ...rest } = dto;
    if (categoryId) {
      await this.validateCategory(categoryId);
    }

    const { uploadedImages } = await this.handleProductImages(
      product.productImages,
      files,
      imagesToDelete,
    );

    return this.prisma
      .$transaction(async (tx) => {
        await tx.productImage.deleteMany({
          where: {
            productId,
            publicId: { in: imagesToDelete },
          },
        });

        if (uploadedImages.length > 0) {
          await tx.productImage.createMany({
            data: uploadedImages.map((img) => ({
              productId,
              url: img.url,
              publicId: img.publicId,
            })),
          });
        }

        return tx.product.update({
          where: { id: productId },
          data: {
            ...rest,
            ...(categoryId && { categoryId }),
          },
        });
      })
      .then((product) => {
        void this.cleanupImages(imagesToDelete);
        return this.getById(product.id);
      })
      .catch(() => {
        this.cleanupImages(uploadedImages.map((img) => img.publicId)).catch(
          console.error,
        );
        throw new InternalServerErrorException();
      });
  }

  private async validateCategory(categoryId: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) throw new NotFoundException('Category not found');
  }

  private async cleanupImages(publicIds: string[]): Promise<void> {
    if (publicIds.length > 0) {
      await this.cloudinaryService.deleteImages(publicIds).catch(() => {
        throw new BadGatewayException('Failed to delete images');
      });
    }
  }

  private async validateProductAccess(
    productId: string,
    userId: string,
  ): Promise<Product & { productImages: Image[] }> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { productImages: true },
    });

    if (!product) throw new NotFoundException('Product not found');
    if (product.sellerId !== userId)
      throw new ForbiddenException('Access denied');

    return product;
  }

  private async handleProductImages(
    currentImages: Image[] = [],
    newFiles: Express.Multer.File[] = [],
    imagesToDelete: string[] = [],
  ) {
    if (imagesToDelete.length > 0) {
      const remainingImages = currentImages.filter(
        (img) => !imagesToDelete.includes(img.publicId),
      );

      if (remainingImages.length === 0 && newFiles.length === 0) {
        throw new ForbiddenException("You can't delete all images");
      }
    }

    let uploadedImages: Image[] = [];
    if (newFiles.length > 0) {
      uploadedImages = await this.cloudinaryService
        .uploadImages(newFiles)
        .catch(() => {
          throw new BadGatewayException('Failed to upload images');
        });
    }
    return { uploadedImages, imagesToDelete };
  }
}
