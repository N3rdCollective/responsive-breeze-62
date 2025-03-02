
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button 
          type="button"
          variant="outline"
          onClick={onOpenPreview}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" /> Preview in Modal
        </Button>
      </div>
      
      <div className="flex justify-end space-x-4 pt-4">
        <Button
          variant="outline"
          onClick={() => navigate("/staff/news")}
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          disabled={isSaving || isUploading}
        >
          {isSaving ? (
            <>
              <LoadingSpinner />
              <span className="ml-2">Saving...</span>
            </>
          ) : (
            "Save Post"
          )}
        </Button>
      </div>
    </div>
  );
};

export default FormActions;
