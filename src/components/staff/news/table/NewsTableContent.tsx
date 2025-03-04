
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Post } from "../types/newsTypes";
import PostRow from "./PostRow";
import EmptyPostsState from "./EmptyPostsState";

interface NewsTableContentProps {
  filteredPosts: Post[] | undefined;
  paginatedPosts: Post[] | undefined;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  refetch: () => void;
}

const NewsTableContent = ({
  filteredPosts,
  paginatedPosts,
  searchTerm,
  setSearchTerm,
  refetch
}: NewsTableContentProps) => {
  console.log("NewsTableContent rendering with refetch function type:", typeof refetch);
  
  const handleRefetch = async () => {
    console.log("NewsTableContent: handleRefetch called");
    try {
      await refetch();
      console.log("NewsTableContent: refetch completed successfully");
    } catch (error) {
      console.error("NewsTableContent: Error in refetch:", error);
    }
  };
  
  return (
    <div className="overflow-x-auto rounded-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="font-medium">Title</TableHead>
            <TableHead className="font-medium">Category</TableHead>
            <TableHead className="font-medium">Date</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium w-[180px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPosts && filteredPosts.length > 0 ? (
            paginatedPosts && paginatedPosts.map((post) => (
              <PostRow 
                key={post.id} 
                post={post} 
                refetch={handleRefetch} 
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-60 text-center">
                <EmptyPostsState searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default NewsTableContent;
