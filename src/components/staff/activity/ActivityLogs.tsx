
import React, { useState } from "react";
import { useActivityLogs, ActivityLog } from "./useActivityLogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { RefreshCw, Search, Info, Filter } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import LogDetailDialog from "./LogDetailDialog";
import LogFilterDropdown from "./LogFilterDropdown";
import LoadingIndicator from "./LoadingIndicator";
import { Badge } from "@/components/ui/badge";

const activityColors: Record<string, string> = {
  "create": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "update": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "delete": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  "login": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  "logout": "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400",
  "approve": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "reject": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  "view": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
};

const getActionColor = (actionType: string) => {
  const baseType = actionType.split('_')[0].toLowerCase();
  return activityColors[baseType] || "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400";
};

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
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-800 dark:text-red-200">
            <p className="font-medium">Error loading activity logs</p>
            <p className="text-sm mt-1">{error}</p>
            <Button variant="outline" className="mt-2" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
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
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={actionTypeFilter || ""} onValueChange={(value) => setActionTypeFilter(value || null)}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  {actionTypeFilter || "Action Type"}
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Actions</SelectItem>
                {uniqueActionTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={entityTypeFilter || ""} onValueChange={(value) => setEntityTypeFilter(value || null)}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  {entityTypeFilter || "Entity Type"}
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Entities</SelectItem>
                {uniqueEntityTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <LoadingIndicator />
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No activity logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow 
                    key={log.id} 
                    className="cursor-pointer hover:bg-accent/30"
                    onClick={() => handleLogClick(log)}
                  >
                    <TableCell className="whitespace-nowrap">{log.formattedDate}</TableCell>
                    <TableCell className="whitespace-nowrap">{log.staff_name}</TableCell>
                    <TableCell>
                      <Badge className={getActionColor(log.action_type)}>
                        {log.action_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[300px] truncate">
                      {log.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
