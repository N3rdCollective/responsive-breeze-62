
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface EmptyPostsStateProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const EmptyPostsState = ({ searchTerm, setSearchTerm }: EmptyPostsStateProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8">
      {searchTerm ? (
        <>
          <Search className="h-8 w-8 text-muted-foreground/60" />
          <p className="text-muted-foreground">No posts match your search</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSearchTerm("")}
            className="mt-2"
          >
            Clear search
          </Button>
        </>
      ) : (
        <>
          <p className="text-muted-foreground">No posts found</p>
          <Button 
            variant="outline" 
            onClick={() => navigate("/staff/news/edit")}
            className="mt-4"
          >
            Create your first post
          </Button>
        </>
      )}
    </div>
  );
};

export default EmptyPostsState;
