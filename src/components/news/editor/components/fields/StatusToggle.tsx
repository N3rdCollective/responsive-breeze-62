
import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NewsStatus } from "../../NewsForm";

interface StatusToggleProps {
  status: NewsStatus;
  setStatus: (status: NewsStatus) => void;
  canPublish?: boolean;
}

const StatusToggle: React.FC<StatusToggleProps> = ({
  status,
  setStatus,
  canPublish = false,
}) => {
  useEffect(() => {
    console.log("[StatusToggle] Current status:", status);
  }, [status]);
  
  const toggleStatus = () => {
    if (canPublish || status === "published") {
      const newStatus: NewsStatus = status === "published" ? "draft" : "published";
      console.log(`[StatusToggle] Explicitly setting status from ${status} to ${newStatus}`);
      setStatus(newStatus);
    }
  };
  
  return (
    <div className="space-y-2 border rounded-md p-4 bg-background/50">
      <Label htmlFor="status" className="text-base font-medium">Status</Label>
      
      <div className="mt-2">
        {!canPublish && status === "draft" && (
          <Alert className="mb-4 text-amber-800 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need admin permissions to publish posts
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={toggleStatus}
            disabled={!canPublish && status === "draft"}
            className={`flex justify-between items-center gap-2 w-full sm:w-auto px-4 py-2 ${
              status === "published"
                ? "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-900/20"
            }`}
          >
            {status === "published" ? (
              <ToggleRight className="h-5 w-5 text-green-500" />
            ) : (
              <ToggleLeft className="h-5 w-5 text-gray-400" />
            )}
            <span className="flex-1 text-left">{status === "published" ? "Published" : "Draft"}</span>
          </Button>
        </div>
        
        <p className="mt-3 text-xs text-muted-foreground">
          {status === "published" 
            ? "Your post is currently live and visible to everyone" 
            : "Your post is saved as a draft and only visible to staff"}
        </p>
      </div>
    </div>
  );
};

export default StatusToggle;
