
import { Badge } from "@/components/ui/badge";

interface CategoryDisplayProps {
  category: string | null;
}

const CategoryDisplay = ({ category }: CategoryDisplayProps) => {
  if (category) {
    return (
      <Badge variant="outline" className="font-normal">
        {category}
      </Badge>
    );
  }
  
  return <span className="text-muted-foreground text-sm">Uncategorized</span>;
};

export default CategoryDisplay;
