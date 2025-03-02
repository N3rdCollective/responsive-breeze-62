
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import PersonalitiesList from "./PersonalitiesList";
import PersonalityDialog from "./PersonalityDialog";
import { usePersonalitiesData } from "./usePersonalitiesData";

interface PersonalitiesManagerProps {
  currentUserRole: string;
}

const PersonalitiesManager = ({ currentUserRole }: PersonalitiesManagerProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState<any>(null);
  
  const { 
    personalities, 
    loading, 
    fetchPersonalities, 
    deletePersonality 
  } = usePersonalitiesData();

  const canModify = currentUserRole === "admin" || currentUserRole === "moderator";

  const handleAddNew = () => {
    setSelectedPersonality(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (personality: any) => {
    setSelectedPersonality(personality);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this personality?")) {
      try {
        await deletePersonality(id);
        toast({
          title: "Success",
          description: "Personality deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting personality:", error);
        toast({
          title: "Error",
          description: "Failed to delete personality",
          variant: "destructive",
        });
      }
    }
  };

  const onDialogClose = (refresh: boolean) => {
    setIsDialogOpen(false);
    if (refresh) {
      fetchPersonalities();
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Radio Personalities</h2>
          {canModify && (
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Personality
            </Button>
          )}
        </div>

        <PersonalitiesList
          personalities={personalities}
          loading={loading}
          onEdit={canModify ? handleEdit : undefined}
          onDelete={canModify ? handleDelete : undefined}
        />
      </Card>

      <PersonalityDialog 
        open={isDialogOpen} 
        onOpenChange={onDialogClose}
        personality={selectedPersonality}
      />
    </div>
  );
};

export default PersonalitiesManager;
