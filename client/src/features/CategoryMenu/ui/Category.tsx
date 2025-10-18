import { categoryApi } from '~/features/CategoryMenu/api/category.api';
import CategoryDialog from '~/features/CategoryMenu/ui/CategoryDialog';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

const Category = async () => {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAllCategories
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CategoryDialog />
    </HydrationBoundary>
  );
};

export default Category;

