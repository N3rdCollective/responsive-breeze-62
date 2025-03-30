
import React, { useState, useEffect } from "react";
import { ActivityLog } from "./useActivityLogs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStaffAuth } from "@/hooks/useStaffAuth";

interface LogDetailDialogProps {
  log: ActivityLog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LogDetailDialog: React.FC<LogDetailDialogProps> = ({ log, open, onOpenChange }) => {
  const [logEdits, setLogEdits] = useState<any[]>([]);
  const [isLoadingEdits, setIsLoadingEdits] = useState(false);
  const { userRole } = useStaffAuth();
  const isSuperAdmin = userRole === "super_admin";
  
  useEffect(() => {
    if (open && log) {
      fetchLogEdits();
    }
  }, [open, log]);
  
  const fetchLogEdits = async () => {
    if (!log) return;
    
    setIsLoadingEdits(true);
    try {
      const { data, error } = await supabase
        .from("log_edits")
        .select(`
          *,
          editor:edited_by (
            email,
            first_name,
            last_name,
            display_name
          )
        `)
        .eq("log_id", log.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      setLogEdits(data || []);
    } catch (error) {
      console.error("Error fetching log edits:", error);
    } finally {
      setIsLoadingEdits(false);
    }
  };
  
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };
  
  const getEntityDescription = () => {
    if (!log.entity_type) return "N/A";
    return `${log.entity_type}${log.entity_id ? ` (ID: ${log.entity_id})` : ''}`;
  };
  
  const renderJsonDetails = (data: any) => {
    if (!data) return "No details available";
    
    try {
      // Try to parse if it's a string
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      
      return (
        <pre className="text-xs bg-muted p-2 rounded overflow-auto">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    } catch (e) {
      return String(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Activity Log Details</DialogTitle>
          <DialogDescription>
            Recorded on {formatDateTime(log.created_at)}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow">
          <div className="space-y-6 p-1">
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <h3 className="text-lg font-semibold">Activity Information</h3>
                <Badge className="w-fit mt-1 sm:mt-0">{log.action_type}</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Staff Member</p>
                  <p>{log.staff_name} ({log.staff_email})</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timestamp</p>
                  <p>{formatDateTime(log.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entity</p>
                  <p>{getEntityDescription()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IP Address</p>
                  <p>{log.ip_address || "Not recorded"}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-md">{log.description}</p>
            </div>
            
            {log.details && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Details</h3>
                {renderJsonDetails(log.details)}
              </div>
            )}
            
            {isLoadingEdits ? (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                <span className="ml-2">Loading edit history...</span>
              </div>
            ) : logEdits.length > 0 ? (
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
                          {renderJsonDetails(edit.previous_values)}
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">New Values</p>
                          {renderJsonDetails(edit.new_values)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </ScrollArea>
        
        <DialogFooter className="px-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogDetailDialog;
