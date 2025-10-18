import { Category } from '~/features/CategoryMenu/model/category.type';
import { api } from '~/shared/lib/api/axios';

class CategoryApi {
  async getAllCategories() {
    return api.get<Category[]>('/categories')
      .then(({ data }) => data);
  }
}

export const categoryApi = new CategoryApi();
