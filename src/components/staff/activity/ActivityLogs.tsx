
import React, { useState } from "react";
import { useActivityLogs, ActivityLog } from "./useActivityLogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import LogDetailDialog from "./LogDetailDialog";
import LoadingIndicator from "./LoadingIndicator";
import LogsTable from "./LogsTable";
import LogFilters from "./LogFilters";
import LogError from "./LogError";
import { getActionColor } from "./utils/activityColors";

const ActivityLogs: React.FC = () => {
  const { logs, isLoading, error, fetchLogs } = useActivityLogs(100);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState<string | null>(null);
  const [entityTypeFilter, setEntityTypeFilter] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const handleRefresh = () => {
    fetchLogs();
  };

  const handleLogClick = (log: ActivityLog) => {
    setSelectedLog(log);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.staff_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action_type.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesActionType = !actionTypeFilter || log.action_type === actionTypeFilter;
    const matchesEntityType = !entityTypeFilter || log.entity_type === entityTypeFilter;
    
    return matchesSearch && matchesActionType && matchesEntityType;
  });

  const uniqueActionTypes = Array.from(new Set(logs.map(log => log.action_type)));
  const uniqueEntityTypes = Array.from(new Set(logs.filter(log => log.entity_type).map(log => log.entity_type as string)));

  if (error) {
    return <LogError error={error} onRefresh={handleRefresh} />;
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Staff Activity Logs</CardTitle>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <LogFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          actionTypeFilter={actionTypeFilter}
          setActionTypeFilter={setActionTypeFilter}
          entityTypeFilter={entityTypeFilter}
          setEntityTypeFilter={setEntityTypeFilter}
          uniqueActionTypes={uniqueActionTypes}
          uniqueEntityTypes={uniqueEntityTypes}
        />

        {isLoading ? (
          <LoadingIndicator />
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No activity logs found.</p>
          </div>
        ) : (
          <LogsTable 
            logs={filteredLogs} 
            onLogClick={handleLogClick} 
            getActionColor={getActionColor}
          />
        )}
      </CardContent>
      
      {selectedLog && (
        <LogDetailDialog 
          log={selectedLog} 
          open={!!selectedLog} 
          onOpenChange={() => setSelectedLog(null)} 
        />
      )}
    </Card>
  );
};

export default ActivityLogs;
