
import React from "react";
import { Badge } from "@/components/ui/badge";
import JsonDetailsView from "./JsonDetailsView";

interface LogEdit {
  id: string;
  created_at: string;
  editor: {
    email?: string;
    first_name?: string;
    last_name?: string;
    display_name?: string;
  };
  edit_reason?: string;
  previous_values: any;
  new_values: any;
}

interface LogEditHistoryProps {
  logEdits: LogEdit[];
  isLoading: boolean;
}

const LogEditHistory: React.FC<LogEditHistoryProps> = ({ logEdits, isLoading }) => {
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
        <span className="ml-2">Loading edit history...</span>
      </div>
    );
  }

  if (logEdits.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Edit History</h3>
      <div className="space-y-4">
        {logEdits.map((edit) => (
          <div key={edit.id} className="border p-3 rounded-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  Edited by {edit.editor?.display_name || edit.editor?.email || "Unknown"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(edit.created_at)}
                </p>
              </div>
              {edit.edit_reason && (
                <Badge variant="outline">Reason: {edit.edit_reason}</Badge>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-sm font-medium mb-1">Previous Values</p>
                <JsonDetailsView data={edit.previous_values} />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">New Values</p>
                <JsonDetailsView data={edit.new_values} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogEditHistory;
