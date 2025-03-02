
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PersonalitiesTableHeaderProps {
  personalitiesCount: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const PersonalitiesTableHeader = ({ 
  personalitiesCount, 
  searchTerm, 
  setSearchTerm,
}: PersonalitiesTableHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search personalities by name or role..."
          className="pl-9 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Total: {personalitiesCount || 0} personalities</span>
      </div>
    </div>
  );
};

export default PersonalitiesTableHeader;
