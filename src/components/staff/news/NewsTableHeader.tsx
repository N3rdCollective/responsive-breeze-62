
import React from "react";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface NewsTableHeaderProps {
  postsCount: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: "all" | "published" | "draft";
  setStatusFilter: (status: "all" | "published" | "draft") => void;
}

const NewsTableHeader = ({ 
  postsCount, 
  searchTerm, 
  setSearchTerm,
  statusFilter,
  setStatusFilter
}: NewsTableHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4">
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-3/4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts by title or category..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            value={statusFilter}
            onValueChange={(value: "all" | "published" | "draft") => setStatusFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All posts</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Total: {postsCount || 0} posts</span>
      </div>
    </div>
  );
};

export default NewsTableHeader;
