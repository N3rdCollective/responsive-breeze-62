
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
import { useForumPaginationItems, PaginationDisplayItem } from '@/hooks/forum/useForumPaginationItems'; // Updated import

interface ForumPaginationProps {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
}

// Removed local PaginationItem interface, it's now PaginationDisplayItem from the hook

const ForumPagination: React.FC<ForumPaginationProps> = ({ page, totalPages, setPage }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Use the new hook to get pagination items
  const paginationItemsToRender = useForumPaginationItems(page, totalPages);

  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (newPage: number, e: React.MouseEvent) => {
    e.preventDefault();
    
    if (newPage === page || newPage < 1 || newPage > totalPages) {
      return; // Don't do anything for invalid page changes
    }
    
    console.log(`[ForumPagination] Changing page from ${page} to ${newPage}`);
    
    const newSearchParams = new URLSearchParams(searchParams);
    if (newPage === 1) {
      newSearchParams.delete('page');
    } else {
      newSearchParams.set('page', newPage.toString());
    }
    
    setSearchParams(newSearchParams, { replace: true });
    setPage(newPage);
  };

  // Removed generatePaginationItems function, logic is now in useForumPaginationItems hook

  return (
    <div className="flex justify-center py-4">
      <Pagination>
        <PaginationContent>
          {/* Previous button */}
          {page > 1 && (
            <PaginationItem key="prev"> {/* Added key for consistency */}
              <PaginationPrevious
                href="#"
                onClick={(e) => handlePageChange(page - 1, e)}
                className="cursor-pointer"
              />
            </PaginationItem>
          )}

          {/* Page numbers and ellipsis */}
          {paginationItemsToRender.map((item: PaginationDisplayItem) => { // Explicitly type item
            if (item.type === 'ellipsis') {
              return (
                <PaginationItem key={item.key}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            // item.type === 'page'
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
            <PaginationItem key="next"> {/* Added key for consistency */}
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
