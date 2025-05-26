
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface NewTopicFormActionsProps {
  submitting: boolean;
  isSubmitDisabled: boolean;
  onCancel: () => void;
}

const NewTopicFormActions: React.FC<NewTopicFormActionsProps> = ({
  submitting,
  isSubmitDisabled,
  onCancel,
}) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={submitting}
        className="border-primary/20"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={submitting || isSubmitDisabled}
        className="bg-primary hover:bg-primary/90"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Topic...
          </>
        ) : (
          'Create Topic'
        )}
      </Button>
    </div>
  );
};

export default NewTopicFormActions;
