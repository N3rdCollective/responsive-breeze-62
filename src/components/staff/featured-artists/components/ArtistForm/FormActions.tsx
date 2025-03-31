
import React from "react";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Loader2, Trash, Archive, ArchiveRestore } from "lucide-react";
import { FeaturedArtist } from "@/components/news/types/newsTypes";

interface FormActionsProps {
  isEditing: boolean;
  isArchived: boolean;
  isSaving: boolean;
  isUploading: boolean;
  selectedArtist: FeaturedArtist | null;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
}

const FormActions: React.FC<FormActionsProps> = ({
  isEditing,
  isArchived,
  isSaving,
  isUploading,
  selectedArtist,
  onDelete,
  onArchive,
  onRestore
}) => {
  return (
    <CardFooter className="flex justify-between flex-wrap gap-2">
      {isEditing && (
        <div className="flex gap-2">
          {onDelete && !isArchived && selectedArtist && (
            <Button 
              type="button" 
              variant="destructive" 
              onClick={() => onDelete(selectedArtist.id)}
              disabled={isSaving || isUploading}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          
          {onArchive && !isArchived && selectedArtist && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onArchive(selectedArtist.id)}
              disabled={isSaving || isUploading}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
          )}

          {onRestore && isArchived && selectedArtist && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onRestore(selectedArtist.id)}
              disabled={isSaving || isUploading}
            >
              <ArchiveRestore className="h-4 w-4 mr-2" />
              Restore
            </Button>
          )}
        </div>
      )}
      <div className={isEditing ? "ml-auto" : "w-full"}>
        {!isArchived && (
          <Button 
            type="submit" 
            disabled={isSaving || isUploading}
            className={!isEditing ? "w-full" : ""}
          >
            {(isSaving || isUploading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEditing ? 'Save Changes' : 'Create Artist'}
          </Button>
        )}
      </div>
    </CardFooter>
  );
};

export default FormActions;
