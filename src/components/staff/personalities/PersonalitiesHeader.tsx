
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PersonalitiesHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Personalities</h1>
        <p className="text-muted-foreground mt-1">
          Create, edit, and manage radio personalities
        </p>
      </div>
      
      <Button 
        onClick={() => navigate("/staff/personalities/edit")}
        className="gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        Add Personality
      </Button>
    </div>
  );
};

export default PersonalitiesHeader;
