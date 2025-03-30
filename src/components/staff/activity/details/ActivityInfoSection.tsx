
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ActivityLog } from "../useActivityLogs";

interface ActivityInfoSectionProps {
  log: ActivityLog;
}

const ActivityInfoSection: React.FC<ActivityInfoSectionProps> = ({ log }) => {
  const getEntityDescription = () => {
    if (!log.entity_type) return "N/A";
    return `${log.entity_type}${log.entity_id ? ` (ID: ${log.entity_id})` : ''}`;
  };
  
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  return (
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
  );
};

export default ActivityInfoSection;
