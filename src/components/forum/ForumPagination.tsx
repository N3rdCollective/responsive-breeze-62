
import React from 'react';
import { useSearchParams } from 'react-router-dom'; // Keep for potential direct use, though setPage handles it
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
  setPage: (page: number) => void; // This setPage will now come from useForumPagination via parent
}

const ForumPagination: React.FC<ForumPaginationProps> = ({ page, totalPages, setPage }) => {
  // useSearchParams can be removed if not directly used for other params here.
  // The parent component will handle URL updates via the passed setPage.
  // const [searchParams, setSearchParams] = useSearchParams(); 
  
  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (newPage: number, e: React.MouseEvent) => {
    e.preventDefault();
    
    if (newPage === page || newPage < 1 || newPage > totalPages) {
      return; // Don't do anything for invalid page changes
    }
    
    console.log(`[ForumPagination] Changing page from ${page} to ${newPage}`);
    
    // Call the setPage function (from useForumPagination) to update the URL and state
    setPage(newPage);
  };

  const renderPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 7; // Show more pages for better UX
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Complex pagination logic for many pages
      // Determine the sibling indices ensuring they are within bounds [1, totalPages]
      const leftSibling = Math.max(page - 1, 1);
      const rightSibling = Math.min(page + 1, totalPages);

      // Determine if dots are needed
      const shouldShowLeftDots = leftSibling > 2; // More than 1 page between '1' and leftSibling
      const shouldShowRightDots = rightSibling < totalPages - 1; // More than 1 page between rightSibling and 'totalPages'

      const firstPageIndex = 1;
      const lastPageIndex = totalPages;
      
      // Case 1: No left dots, but right dots needed
      // Example: 1 2 3 4 5 ... 20 (current page is 1, 2, 3 or 4)
      if (!shouldShowLeftDots && shouldShowRightDots) {
        let leftItemCount = 5; // Show 1, 2, 3, 4, 5
        if (totalPages < leftItemCount) leftItemCount = totalPages;
        const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
        pageNumbers.push(...leftRange, 'dots', lastPageIndex);
      } 
      // Case 2: Left dots needed, but no right dots
      // Example: 1 ... 16 17 18 19 20 (current page is 17, 18, 19 or 20)
      else if (shouldShowLeftDots && !shouldShowRightDots) {
        let rightItemCount = 5; // Show 16, 17, 18, 19, 20
        if (totalPages < rightItemCount) rightItemCount = totalPages;

        const rightRange = Array.from(
          { length: rightItemCount },
          (_, i) => totalPages - rightItemCount + i + 1
        );
        pageNumbers.push(firstPageIndex, 'dots', ...rightRange);
      } 
      // Case 3: Both left and right dots needed
      // Example: 1 ... 8 9 10 ... 20 (current page is 9, 10 or 11)
      else if (shouldShowLeftDots && shouldShowRightDots) {
        // Show page, page-1, page+1
        const middleRange = [leftSibling, page, rightSibling].filter(p => p >= firstPageIndex && p <= lastPageIndex);
        // Deduplicate in case page is 1 or totalPages and siblings are same
        const uniqueMiddleRange = [...new Set(middleRange)].sort((a,b) => a-b);


        pageNumbers.push(firstPageIndex, 'dots');
        if (uniqueMiddleRange[0] > firstPageIndex + 1 && uniqueMiddleRange[0] !== firstPageIndex && uniqueMiddleRange[0] !== 'dots') {
           // pageNumbers.push('dots');
        }
        pageNumbers.push(...uniqueMiddleRange);

        if (uniqueMiddleRange[uniqueMiddleRange.length -1] < lastPageIndex -1 && uniqueMiddleRange[uniqueMiddleRange.length -1] !== lastPageIndex && uniqueMiddleRange[uniqueMiddleRange.length -1] !== 'dots' ) {
            pageNumbers.push('dots');
        }
        pageNumbers.push(lastPageIndex);
        
        // Refined logic for middle range to ensure it's distinct and doesn't produce double dots
        const tempPageNumbers = [firstPageIndex];
        if (page > 3) tempPageNumbers.push('dots');

        const startPage = Math.max(2, page - 1);
        const endPage = Math.min(totalPages - 1, page + 1);

        for (let i = startPage; i <= endPage; i++) {
            if (i === firstPageIndex || i === lastPageIndex) continue;
            tempPageNumbers.push(i);
        }
        
        if (page < totalPages - 2) tempPageNumbers.push('dots');
        if (totalPages > 1) tempPageNumbers.push(lastPageIndex); // Avoid duplicate if totalPages=1

        // Remove duplicate 'dots' or redundant page numbers
        const finalPages: (number | string)[] = [];
        let lastPushed: (number | string | null) = null;
        for (const p of tempPageNumbers) {
            if (p === 'dots' && lastPushed === 'dots') continue;
            if (typeof p === 'number' && typeof lastPushed === 'number' && p <= lastPushed) continue; // ensure increasing numbers
            finalPages.push(p);
            lastPushed = p;
        }
        // If first item is 'dots' because page is 1, remove it if page 1 is already there
        if (finalPages[0] === 1 && finalPages[1] === 'dots' && finalPages[2] === 1) finalPages.splice(1,1);
        // If last item is 'dots' because page is totalPages, remove it if totalPages is already there
        if (finalPages[finalPages.length-1] === totalPages && finalPages[finalPages.length-2] === 'dots' && finalPages[finalPages.length-3] === totalPages) finalPages.splice(finalPages.length-2,1);


        return finalPages.filter((item, idx, arr) => { // Remove duplicate numbers/dots
          if (item === 'dots' && arr[idx-1] === 'dots') return false;
          if (typeof item === 'number' && item === arr[idx-1]) return false;
          return true;
        });

      } else { // Default for very few pages or other edge cases not caught by above (e.g. totalPages slightly > maxPagesToShow)
          const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);
          pageNumbers.push(...allPages);
      }
    }
    
    return pageNumbers.filter((item, idx, arr) => { // Final cleanup for duplicates
        if (item === 'dots' && arr[idx-1] === 'dots') return false;
        if (typeof item === 'number' && item === arr[idx-1]) return false;
        return true;
    });
  };

  const pageNumbersToRender = renderPageNumbers();

  return (
    <div className="flex justify-center py-4 px-4 border-t">
      <Pagination>
        <PaginationContent>
          {/* Previous button */}
          {page > 1 && (
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => handlePageChange(page - 1, e)}
                className="cursor-pointer"
              />
            </PaginationItem>
          )}

          {/* Page numbers */}
          {pageNumbersToRender.map((pageNum, index) => {
            if (pageNum === 'dots') {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            
            const pageNumber = pageNum as number;
            const isActive = page === pageNumber;
            
            return (
              <PaginationItem key={pageNumber}>
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
            <PaginationItem>
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
