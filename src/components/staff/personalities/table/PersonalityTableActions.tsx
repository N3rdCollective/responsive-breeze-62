
import { useNavigate } from "react-router-dom";
import { Edit, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface PersonalityTableActionsProps {
  personalityId: string;
  refetch: () => void;
}

const PersonalityTableActions = ({ personalityId, refetch }: PersonalityTableActionsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const deletePersonality = async (id: string) => {
    if (!confirm("Are you sure you want to delete this personality?")) return;
    
    const { error } = await supabase
      .from("personalities")
      .delete()
      .eq("id", id);
      
    if (error) {
      toast({
        title: "Error deleting personality",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Personality deleted",
      description: "The personality has been successfully deleted.",
    });
    
    refetch();
  };

  return (
    <div className="flex justify-end items-center gap-2">
      <Button
        variant="ghost" 
        size="icon"
        onClick={() => navigate(`/personalities/${personalityId}`)}
        title="View personality"
        className="h-8 w-8"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(`/staff/personalities/edit/${personalityId}`)}
        title="Edit personality"
        className="h-8 w-8"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="destructive"
        size="icon"
        onClick={() => deletePersonality(personalityId)}
        title="Delete personality"
        className="h-8 w-8"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PersonalityTableActions;
