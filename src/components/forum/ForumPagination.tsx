
import React from 'react';
// Remove useSearchParams import, as it's no longer needed here
// import { useSearchParams } from 'react-router-dom'; 
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";
import { useForumPaginationItems, PaginationDisplayItem } from '@/hooks/forum/useForumPaginationItems';

interface ForumPaginationProps {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
}

const ForumPagination: React.FC<ForumPaginationProps> = ({ page, totalPages, setPage }) => {
  // Remove useSearchParams hook call
  // const [searchParams, setSearchParams] = useSearchParams();
  
  const paginationItemsToRender = useForumPaginationItems(page, totalPages);

  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (newPage: number, e: React.MouseEvent) => {
    e.preventDefault();
    
    if (newPage === page || newPage < 1 || newPage > totalPages) {
      return; 
    }
    
    console.log(`[ForumPagination] Calling setPage to change from ${page} to ${newPage}`);
    
    // Remove direct URL manipulation. 
    // The setPage prop (from useForumPagination) will handle updating the URL.
    // const newSearchParams = new URLSearchParams(searchParams);
    // if (newPage === 1) {
    //   newSearchParams.delete('page');
    // } else {
    //   newSearchParams.set('page', newPage.toString());
    // }
    // setSearchParams(newSearchParams, { replace: true });
    
    setPage(newPage); // This call will now be the sole trigger for page change logic and URL update.
  };

  // Removed generatePaginationItems function, logic is now in useForumPaginationItems hook

  return (
    <div className="flex justify-center py-4">
      <Pagination>
        <PaginationContent>
          {/* Previous button */}
          {page > 1 && (
            <PaginationItem key="prev">
              <PaginationPrevious
                href="#"
                onClick={(e) => handlePageChange(page - 1, e)}
                className="cursor-pointer"
              />
            </PaginationItem>
          )}

          {/* Page numbers and ellipsis */}
          {paginationItemsToRender.map((item: PaginationDisplayItem) => {
            if (item.type === 'ellipsis') {
              return (
                <PaginationItem key={item.key}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            const pageNumber = item.value;
            const isActive = page === pageNumber;
            
            return (
              <PaginationItem key={item.key}>
                <PaginationLink
                  href="#"
                  onClick={(e) => handlePageChange(pageNumber, e)}
                  isActive={isActive}
                  className={`cursor-pointer ${
                    isActive 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {/* Next button */}
          {page < totalPages && (
            <PaginationItem key="next">
              <PaginationNext
                href="#"
                onClick={(e) => handlePageChange(page + 1, e)}
                className="cursor-pointer"
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default ForumPagination;
