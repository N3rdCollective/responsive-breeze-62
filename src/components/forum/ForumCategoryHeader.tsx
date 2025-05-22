
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ForumCategory } from '@/types/forum';

interface ForumCategoryHeaderProps {
  category: ForumCategory;
  categorySlug: string | undefined;
}

const ForumCategoryHeader: React.FC<ForumCategoryHeaderProps> = ({ category, categorySlug }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600 dark:text-gray-400 mt-1">{category.description}</p>
        )}
      </div>
      <Button asChild className="bg-primary hover:bg-primary/90">
        <Link to={`/members/forum/${categorySlug}/new`}>
          <PlusCircle className="h-4 w-4 mr-2" /> New Topic
        </Link>
      </Button>
    </div>
  );
};

export default ForumCategoryHeader;
