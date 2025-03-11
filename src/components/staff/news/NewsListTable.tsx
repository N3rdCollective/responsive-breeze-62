
import { useState, useEffect } from "react";
import { Post } from "./types/newsTypes";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import NewsTableContent from "./table/NewsTableContent";
import NewsPagination from "./table/NewsPagination";
import { useNewsManagement } from "./useNewsManagement";

interface NewsListTableProps {
  refreshTrigger?: number;
  onPostStatusChange?: () => void;
}

const NewsListTable = ({
  refreshTrigger = 0,
  onPostStatusChange
}: NewsListTableProps) => {
  const {
    posts,
    filteredPosts,
    paginatedPosts,
    pagination,
    isLoading,
    searchTerm,
    setSearchTerm,
    refetch,
    handlePageChange
  } = useNewsManagement();

  // Effect to refetch when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  // Callback for when post status changes
  const handlePostStatusChange = () => {
    refetch();
    if (onPostStatusChange) {
      onPostStatusChange();
    }
  };

  const { currentPage, totalPages } = pagination;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <NewsTableContent 
        filteredPosts={filteredPosts}
        paginatedPosts={paginatedPosts}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        refetch={handlePostStatusChange}
      />
      
      {filteredPosts && filteredPosts.length > 0 && totalPages > 1 && (
        <NewsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default NewsListTable;
