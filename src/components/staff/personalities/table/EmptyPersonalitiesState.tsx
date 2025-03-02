
import { Button } from "@/components/ui/button";
import { UserRoundPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmptyPersonalitiesStateProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const EmptyPersonalitiesState = ({ searchTerm, setSearchTerm }: EmptyPersonalitiesStateProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <UserRoundPlus className="h-12 w-12 text-muted-foreground mb-4" />
      
      <h3 className="text-xl font-semibold mb-2">
        {searchTerm ? "No personalities found" : "No personalities added yet"}
      </h3>
      
      <p className="text-muted-foreground text-center max-w-md mb-6">
        {searchTerm
          ? `We couldn't find any personalities matching "${searchTerm}". Try a different search term or clear your search.`
          : "Add your first personality to showcase the talent behind your radio station."}
      </p>
      
      {searchTerm ? (
        <Button variant="outline" onClick={() => setSearchTerm("")}>
          Clear Search
        </Button>
      ) : (
        <Button onClick={() => navigate("/staff/personalities/edit")}>
          Add Personality
        </Button>
      )}
    </div>
  );
};

export default EmptyPersonalitiesState;
