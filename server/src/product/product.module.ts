import { Module } from '@nestjs/common';
import { CloudinaryModule } from '~/cloudinary/cloudinary.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
