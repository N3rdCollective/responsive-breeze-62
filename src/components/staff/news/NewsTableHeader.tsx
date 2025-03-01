
import React from "react";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface NewsTableHeaderProps {
  postsCount: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const NewsTableHeader = ({ 
  postsCount, 
  searchTerm, 
  setSearchTerm 
}: NewsTableHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4">
      <div className="relative w-full md:w-1/2">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search posts by title or category..."
          className="pl-9 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Total: {postsCount || 0} posts</span>
      </div>
    </div>
  );
};

export default NewsTableHeader;
