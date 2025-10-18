import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from '~/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCategories(): Promise<Category[]> {
    return this.prisma.category.findMany();
  }
}
