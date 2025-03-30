
import React from "react";
import { ActivityLog } from "./useActivityLogs";
import { Info } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LogsTableProps {
  logs: ActivityLog[];
  onLogClick: (log: ActivityLog) => void;
  getActionColor: (actionType: string) => string;
}

const LogsTable: React.FC<LogsTableProps> = ({ 
  logs, 
  onLogClick,
  getActionColor 
}) => {
  return (
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
          {logs.map((log) => (
            <TableRow 
              key={log.id} 
              className="cursor-pointer hover:bg-accent/30"
              onClick={() => onLogClick(log)}
            >
              <TableCell className="whitespace-nowrap">
                {new Date(log.created_at).toLocaleString()}
              </TableCell>
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
  );
};

export default LogsTable;
