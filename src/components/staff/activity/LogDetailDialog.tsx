
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import ActivityInfoSection from "./details/ActivityInfoSection";
import JsonDetailsView from "./details/JsonDetailsView";
import LogEditHistory from "./details/LogEditHistory";

interface LogDetailDialogProps {
  log: ActivityLog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LogDetailDialog: React.FC<LogDetailDialogProps> = ({ log, open, onOpenChange }) => {
  const [logEdits, setLogEdits] = useState<any[]>([]);
  const [isLoadingEdits, setIsLoadingEdits] = useState(false);
  const { userRole } = useStaffAuth();
  
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Activity Log Details</DialogTitle>
          <DialogDescription>
            Recorded on {new Date(log.created_at).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow">
          <div className="space-y-6 p-1">
            <ActivityInfoSection log={log} />
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-md">{log.description}</p>
            </div>
            
            {log.details && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Details</h3>
                <JsonDetailsView data={log.details} />
              </div>
            )}
            
            <LogEditHistory 
              logEdits={logEdits} 
              isLoading={isLoadingEdits} 
            />
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
