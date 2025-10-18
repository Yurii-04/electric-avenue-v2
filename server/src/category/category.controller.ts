import { Controller, Get } from '@nestjs/common';
import { Category } from '@prisma/client';
import { Public } from '~/common/decorators/public.decorator';
import { CategoryService } from './category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Public()
  @Get()
  async getAll(): Promise<Category[]> {
    return this.categoryService.getAllCategories();
  }
}
