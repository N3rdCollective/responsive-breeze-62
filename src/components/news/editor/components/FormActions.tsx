
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Save, X } from "lucide-react";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import { useNavigate } from "react-router-dom";

interface FormActionsProps {
  onSave: () => void;
  isSaving: boolean;
  isUploading: boolean;
  onOpenPreview: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({
  onSave,
  isSaving,
  isUploading,
  onOpenPreview,
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="sticky bottom-0 bg-background border-t p-4 shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => navigate("/staff/news")}
        >
          <X className="h-4 w-4" /> Cancel
        </Button>
        
        <div className="flex gap-3">
          <Button 
            type="button"
            variant="outline"
            onClick={onOpenPreview}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" /> Preview on Site
          </Button>
          
          <Button
            onClick={onSave}
            disabled={isSaving || isUploading}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <LoadingSpinner />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Post
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormActions;
