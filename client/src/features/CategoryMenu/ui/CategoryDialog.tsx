'use client';

import {
  Dialog,
  DialogContent, DialogDescription,
  DialogHeader, DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '~/shared/components/ui/dialog';
import { Button } from '~/shared/components/ui/button';
import { ChevronLeft, LayoutGrid } from 'lucide-react';
import { useCategories } from '~/features/CategoryMenu/lib/useCategories';
import Loader from '~/shared/ui/Loader';
import { useEffect, useState } from 'react';
import { handleApiError } from '~/shared/lib/api/handleApiError';
import { type Category } from '~/features/CategoryMenu/model/category.type';
import Image from 'next/image';

const CategoryDialog = () => {
  const { data: categories, isLoading, isError, error } = useCategories();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [path, setPath] = useState<string[]>([]);

  useEffect(() => {
    if (isError && error) {
      handleApiError(error);
    }
  }, [isError, error]);

  const currentParentId = path[path.length - 1] ?? null;
  const currentCategories = categories?.filter(cat => cat.parentId === currentParentId) ?? [];
  const currentCategory = categories?.find(cat => cat.id === currentParentId);

  const handleCategoryClick = async (category: Category) => {
    if (!category.isGroup && category.parentId) {
      console.log('Searching products for category:', category.id);
      setIsOpen(false);
      setPath([]);
    } else {
      setPath([...path, category.id]);
    }
  };

  const handleBack = () => setPath(path.slice(0, -1));

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) setPath([]);
  };

  const getTitle = () => {
    if (path.length === 0) return 'Choose category';
    return currentCategory?.name ?? 'Categories';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogOverlay className="fixed inset-0 bg-transparent backdrop-blur-xs"/>
      <DialogTrigger asChild>
        <Button className="hover:bg-[#f5f5f4]" variant="ghost" size="sm">
          <LayoutGrid className="mr-2" /> Catalog
        </Button>
      </DialogTrigger>
      <DialogContent className="w-screen h-screen sm:h-[500px] sm:w-[320px] max-w-full overflow-hidden p-0 flex flex-col">
        <DialogDescription className="sr-only">
          Category selection dialog
        </DialogDescription>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          <>
            <DialogHeader className="pt-2.5 h-fit items-start">
              <div className="h-8">
                {path.length > 0 && (
                  <Button variant="link" size="sm" onClick={handleBack} className="w-fit">
                    <ChevronLeft />
                  </Button>
                )}
              </div>
              <DialogTitle className="text-center w-full">{getTitle()}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto py-4 px-2 space-y-2 custom-scrollbar">
              {currentCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className="w-full flex items-center p-3 gap-3 rounded-lg hover:bg-gray-100 transition-colors text-left group"
                >
                  {category.icon && <Image width={20} height={20} src={category.icon} alt={category.name} />}
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;
