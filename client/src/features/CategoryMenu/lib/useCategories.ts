import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '~/features/CategoryMenu/api/category.api';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAllCategories,
    staleTime: 1000 * 60 * 5,
    retry: 1
  });
};
