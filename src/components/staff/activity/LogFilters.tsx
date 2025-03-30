
import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface LogFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  actionTypeFilter: string | null;
  setActionTypeFilter: (type: string | null) => void;
  entityTypeFilter: string | null;
  setEntityTypeFilter: (type: string | null) => void;
  uniqueActionTypes: string[];
  uniqueEntityTypes: string[];
}

const LogFilters: React.FC<LogFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  actionTypeFilter,
  setActionTypeFilter,
  entityTypeFilter,
  setEntityTypeFilter,
  uniqueActionTypes,
  uniqueEntityTypes
}) => {
  return (
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
            <SelectItem value="all">All Actions</SelectItem>
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
            <SelectItem value="all">All Entities</SelectItem>
            {uniqueEntityTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default LogFilters;
