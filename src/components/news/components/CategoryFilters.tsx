
import { Button } from "@/components/ui/button";

interface CategoryFiltersProps {
  categories: string[] | undefined;
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export const CategoryFilters = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}: CategoryFiltersProps) => {
  if (!categories || categories.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        onClick={() => onCategorySelect(null)}
        className="text-sm"
      >
        All
      </Button>
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          onClick={() => onCategorySelect(category)}
          className="text-sm"
        >
          {category}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilters;
