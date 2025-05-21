
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";

interface ForumPaginationProps {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
}

const ForumPagination: React.FC<ForumPaginationProps> = ({ page, totalPages, setPage }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (newPage: number) => {
    if (newPage === page) return; // Don't do anything if clicking the current page
    
    // Update the URL with the new page
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', newPage.toString());
    setSearchParams(newSearchParams, { replace: true }); // Use replace: true to avoid adding to browser history
    
    // Call the setPage function to update the state
    setPage(newPage);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Example: Show 1 ... 3 4 5 ... 10
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1); // Always show first page
      if (page > halfPagesToShow + 1) {
        pageNumbers.push(-1); // Ellipsis indicator
      }

      let startPage = Math.max(2, page - halfPagesToShow + (page > totalPages - halfPagesToShow ? (totalPages - page - halfPagesToShow +1) : 1) );
      let endPage = Math.min(totalPages - 1, page + halfPagesToShow - (page < halfPagesToShow +1 ? (page - halfPagesToShow ) :1) );
      
      // Adjust if page is near the beginning
      if (page <= halfPagesToShow) {
        startPage = 2;
        endPage = Math.min(totalPages -1, maxPagesToShow -1);
      }
      // Adjust if page is near the end
      else if (page >= totalPages - halfPagesToShow +1 ) {
        startPage = Math.max(2, totalPages - maxPagesToShow +2);
        endPage = totalPages -1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (page < totalPages - halfPagesToShow) {
         pageNumbers.push(-1); // Ellipsis indicator
      }
      pageNumbers.push(totalPages); // Always show last page
    }
    return pageNumbers;
  };


  return (
    <div className="py-4 px-4 border-t">
      <Pagination>
        <PaginationContent>
          {page > 1 && (
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(page - 1);
                }}
              />
            </PaginationItem>
          )}

          {renderPageNumbers().map((pageNum, index) => {
            if (pageNum === -1) {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(pageNum);
                  }}
                  isActive={page === pageNum}
                  className={page === pageNum ? "bg-primary text-primary-foreground" : ""}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {page < totalPages && (
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(page + 1);
                }}
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default ForumPagination;
