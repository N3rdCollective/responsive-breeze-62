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

  const handlePageChange = (newPage: number, e: React.MouseEvent) => {
    e.preventDefault();
    
    if (newPage === page || newPage < 1 || newPage > totalPages) {
      return; // Don't do anything for invalid page changes
    }
    
    console.log(`[ForumPagination] Changing page from ${page} to ${newPage}`);
    
    // Update the URL with the new page
    const newSearchParams = new URLSearchParams(searchParams);
    if (newPage === 1) {
      // Remove page param for page 1 to keep URLs clean
      newSearchParams.delete('page');
    } else {
      newSearchParams.set('page', newPage.toString());
    }
    
    setSearchParams(newSearchParams, { replace: true });
    
    // Call the setPage function to update the state
    setPage(newPage);
  };

  const renderPageNumbers = () => {
    const pageNumbers: Array<{ type: 'page' | 'dots'; value: number }> = [];
    const maxPagesToShow = 7; // Show more pages for better UX
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push({ type: 'page', value: i });
      }
    } else {
      // Complex pagination logic for many pages
      const leftSiblingIndex = Math.max(page - 1, 1);
      const rightSiblingIndex = Math.min(page + 1, totalPages);
      
      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 2;
      
      const firstPageIndex = 1;
      const lastPageIndex = totalPages;
      
      if (!shouldShowLeftDots && shouldShowRightDots) {
        // Show: 1 2 3 4 5 ... N
        // Calculate how many numbers to show on the left. It should be a fixed number.
        // Let's aim for 1, 2, 3, 4, 5, ..., N. (5 items then dots)
        const leftItemCount = 5; 
        for (let i = 1; i <= Math.min(leftItemCount, totalPages -1) ; i++) { // Ensure we don't exceed totalPages-1 if N is close
          pageNumbers.push({ type: 'page', value: i });
        }
        if (totalPages > leftItemCount) { // Only show dots if there are more pages than what's shown
            pageNumbers.push({ type: 'dots', value: -1 }); // -1 or any other placeholder for dots
        }
        pageNumbers.push({ type: 'page', value: lastPageIndex });

      } else if (shouldShowLeftDots && !shouldShowRightDots) {
        // Show: 1 ... N-4 N-3 N-2 N-1 N
        // Calculate how many numbers to show on the right.
        const rightItemCount = 5;
        pageNumbers.push({ type: 'page', value: firstPageIndex });
        if (totalPages > rightItemCount) { // Only show dots if there are more pages than what's shown
            pageNumbers.push({ type: 'dots', value: -1 });
        }
        for (let i = Math.max(2, totalPages - rightItemCount + 1); i <= totalPages; i++) { // Ensure we start from at least page 2 if N is small
          pageNumbers.push({ type: 'page', value: i });
        }
      } else if (shouldShowLeftDots && shouldShowRightDots) {
        // Show: 1 ... P-1 P P+1 ... N
        pageNumbers.push({ type: 'page', value: firstPageIndex });
        pageNumbers.push({ type: 'dots', value: -1 });
        
        // Middle pages: current page and its direct siblings
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
          pageNumbers.push({ type: 'page', value: i });
        }
        
        pageNumbers.push({ type: 'dots', value: -1 });
        pageNumbers.push({ type: 'page', value: lastPageIndex });
      } else {
        // Fallback for very few pages or other edge cases (e.g. totalPages slightly > maxPagesToShow but not caught)
        // This usually means totalPages is small enough that dots logic isn't triggered,
        // or page is at one of the ends making one of the dot conditions false.
        // This case should ideally be covered by `totalPages <= maxPagesToShow` or specific conditions above.
        // For safety, let's build a sequence like 1, 2, current, ..., N or 1, ..., current, N-1, N
        // or 1, ..., current-1, current, current+1, ..., N

        // Default to showing first, last, and a few around current page if not perfectly covered.
        // This is a simplified version. A more robust one would be:
        // 1, (dots if page > 3), page-1, page, page+1, (dots if page < N-2), N
        pageNumbers.push({ type: 'page', value: firstPageIndex }); // Always show first page

        if (page > 2 && page-1 > firstPageIndex +1) { // Check if dots are needed after first page
            pageNumbers.push({ type: 'dots', value: -1 });
        }

        // Add page-1, page, page+1 if they are not first or last page
        const middlePages = [page - 1, page, page + 1].filter(
            p => p > firstPageIndex && p < lastPageIndex
        );
        // Remove duplicates just in case, though logic should prevent it
        const uniqueMiddlePages = [...new Set(middlePages)].sort((a,b) => a-b);

        for (const pVal of uniqueMiddlePages) {
            if (pVal > 0) pageNumbers.push({ type: 'page', value: pVal });
        }

        if (page < totalPages - 1 && page + 1 < lastPageIndex -1) { // Check if dots are needed before last page
             pageNumbers.push({ type: 'dots', value: -1 });
        }
        if (totalPages > 1) { // Always show last page if more than 1 page
            pageNumbers.push({ type: 'page', value: lastPageIndex });
        }

        // Remove duplicate page numbers and consecutive dots
        const finalPageNumbers: Array<{ type: 'page' | 'dots'; value: number }> = [];
        let lastPushedItem: { type: string, value: number } | null = null;
        for(const item of pageNumbers) {
            if (item.type === 'dots' && lastPushedItem?.type === 'dots') continue;
            if (item.type === 'page' && lastPushedItem?.type === 'page' && item.value === lastPushedItem.value) continue;
            finalPageNumbers.push(item);
            lastPushedItem = item;
        }
        return finalPageNumbers;
      }
    }
    
    // Deduplicate and ensure logical order for pageNumbers if necessary
    // This step might be important if the logic above creates duplicates (e.g., page 1 pushed multiple times)
    const uniquePageNumbers: Array<{ type: 'page' | 'dots'; value: number }> = [];
    const seenValues = new Set<number>();
    let lastType: string | null = null;

    for (const item of pageNumbers) {
        if (item.type === 'page') {
            if (!seenValues.has(item.value)) {
                uniquePageNumbers.push(item);
                seenValues.add(item.value);
                lastType = 'page';
            }
        } else if (item.type === 'dots') {
            // Only add dots if the last item wasn't also dots
            if (lastType !== 'dots') {
                uniquePageNumbers.push(item);
                lastType = 'dots';
            }
        }
    }
    // Sort page type items by value, keep dots in place (this is complex, simplify by ensuring construction order is correct)
    // For now, the construction logic order should mostly handle this.
    // A simple sort on 'page' items could mess up 'dots' placement.
    // The easiest fix is to ensure the `if/else if` blocks construct them in display order.

    return uniquePageNumbers;
  };

  const pageItemsToRender = renderPageNumbers();

  return (
    <div className="flex justify-center py-4">
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
          {pageItemsToRender.map((item, index) => {
            if (item.type === 'dots') {
              return (
                <PaginationItem key={`ellipsis-${index}-${item.value}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            
            const pageNumber = item.value;
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
