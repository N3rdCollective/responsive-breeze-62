import React from 'react';
import { Calendar, User, Target, Info, Eye, EyeOff, Clock, Tag, Globe, Edit, Trash2, Settings, FileText, Shield, UserCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate, formatTime } from "@/lib/dateUtils";
import { useAuth } from "@/hooks/useAuth";

interface LogDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  logEntry: any;
}

const LogDetailDialog = ({ isOpen, onOpenChange, logEntry }: LogDetailDialogProps) => {
  const { staffRole } = useAuth();
  
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'create':
        return <FileText className="h-4 w-4 mr-2 text-green-500" />;
      case 'update':
        return <Edit className="h-4 w-4 mr-2 text-blue-500" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 mr-2 text-red-500" />;
      case 'login':
        return <UserCheck className="h-4 w-4 mr-2 text-green-500" />;
      case 'logout':
        return <LogOut className="h-4 w-4 mr-2 text-red-500" />;
      case 'publish':
        return <Globe className="h-4 w-4 mr-2 text-green-500" />;
      case 'unpublish':
        return <Globe className="h-4 w-4 mr-2 text-red-500" />;
      case 'moderate':
        return <Shield className="h-4 w-4 mr-2 text-yellow-500" />;
      case 'settings':
        return <Settings className="h-4 w-4 mr-2 text-gray-500" />;
      default:
        return <Info className="h-4 w-4 mr-2 text-gray-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Activity Log Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] w-full">
          <div className="p-4">
            <div className="mb-4">
              <div className="flex items-center text-sm text-muted-foreground">
                {getActionIcon(logEntry?.actionType)}
                <span className="font-medium">{logEntry?.actionType}</span>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(logEntry?.timestamp)}</span>
                <Clock className="h-4 w-4 mx-1" />
                <span>{formatTime(logEntry?.timestamp)}</span>
              </div>
              <p className="mt-2 text-lg font-semibold">{logEntry?.description}</p>
            </div>
            <Separator />
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">Details</h3>
              <ul className="list-disc pl-5">
                {Object.entries(logEntry?.details || {}).map(([key, value]) => (
                  <li key={key} className="text-sm">
                    <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default LogDetailDialog;
