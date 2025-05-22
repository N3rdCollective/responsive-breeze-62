
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

// Changed to a type alias as it's used locally for the items array structure
type PaginationDisplayItem = {
  type: 'page' | 'ellipsis';
  value: number; // value is -1 for ellipsis, page number for 'page'
  key: string;
};

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

  const generatePaginationItems = (): PaginationDisplayItem[] => {
    const items: PaginationDisplayItem[] = [];
    const MAX_PAGES_DISPLAYED = 7; // Maximum items to show including ellipsis

    // Simple case: if total pages are few, show all
    if (totalPages <= MAX_PAGES_DISPLAYED) {
      for (let i = 1; i <= totalPages; i++) {
        items.push({
          type: 'page',
          value: i,
          key: `page-${i}`
        });
      }
      return items;
    }

    // Complex case: more pages than can be shown directly
    // Always show first page
    items.push({
      type: 'page',
      value: 1,
      key: 'page-1'
    });

    // Determine the range of pages to show around the current page
    // Sibling count on each side of the current page
    const SIBLING_COUNT = 1; 
    
    // Pages to show: first, ellipsis, prevSibling, current, nextSibling, ellipsis, last
    // Left side
    const leftSiblingStart = Math.max(2, page - SIBLING_COUNT);
    const leftSiblingEnd = Math.max(1, page - 1); // Will be capped by right side logic later
    
    // Right side
    const rightSiblingStart = Math.min(totalPages -1, page + 1);
    const rightSiblingEnd = Math.min(totalPages -1, page + SIBLING_COUNT);

    // Show left ellipsis if needed
    if (page > SIBLING_COUNT + 2) { // (1 + SIBLING_COUNT + 1 for ellipsis + 1 for first page)
        items.push({ type: 'ellipsis', value: -1, key: 'ellipsis-start'});
    }
    
    // Determine actual range to display:
    // This logic is tricky. We want to show a certain number of items.
    // Let's simplify: Show 1, ..., current-1, current, current+1, ..., N
    // Number of pages to show around current:
    const pagesAroundCurrent: number[] = [];
    if (page > 1 && page < totalPages) { // Current page is not first or last
        if (page - 1 > 1) pagesAroundCurrent.push(page -1);
        pagesAroundCurrent.push(page);
        if (page + 1 < totalPages) pagesAroundCurrent.push(page + 1);
    } else if (page === 1 && totalPages > 1) { // Current is first
        pagesAroundCurrent.push(page);
        if (page + 1 < totalPages) pagesAroundCurrent.push(page + 1);
        if (page + 2 < totalPages && SIBLING_COUNT > 0) pagesAroundCurrent.push(page+2);

    } else if (page === totalPages && totalPages > 1) { // Current is last
        if (page - 2 > 1 && SIBLING_COUNT > 0) pagesAroundCurrent.push(page - 2);
        if (page - 1 > 1) pagesAroundCurrent.push(page - 1);
        pagesAroundCurrent.push(page);
    }


    // Refined logic for middle pages:
    let showLeftEllipsis = true;
    let showRightEllipsis = true;

    // If page is close to the start
    if (page <= SIBLING_COUNT + 2) { // e.g. 1,2,3,4 (page 1,2,3,4 for SC=1)
        for(let i = 2; i <= Math.min(totalPages -1, SIBLING_COUNT * 2 + 2); i++) {
             items.push({ type: 'page', value: i, key: `page-${i}`});
        }
        showLeftEllipsis = false;
    } else {
        // Handled by initial left ellipsis push already if page > SIBLING_COUNT + 2
    }

    // If page is close to the end
    if (page >= totalPages - (SIBLING_COUNT + 1)) { // e.g. N, N-1, N-2, N-3 (page N, N-1, N-2, N-3 for SC=1)
        for(let i = Math.max(2, totalPages - (SIBLING_COUNT * 2 + 1) ); i <= totalPages -1 ; i++) {
             // Avoid duplicates if already added by start-logic
             if (!items.find(it => it.type === 'page' && it.value === i)) {
                items.push({ type: 'page', value: i, key: `page-${i}`});
             }
        }
        showRightEllipsis = false;
    } else {
        // Handled by later right ellipsis push if needed
    }
    
    // If page is in the middle (not close to start or end)
    if (showLeftEllipsis && showRightEllipsis) {
        // items already has 'page-1' and 'ellipsis-start'
        for (let i = page - SIBLING_COUNT; i <= page + SIBLING_COUNT; i++) {
            if (i > 1 && i < totalPages) { // Ensure it's not first or last, and not already added
                 if (!items.find(it => it.type === 'page' && it.value === i)) {
                    items.push({ type: 'page', value: i, key: `page-${i}`});
                 }
            }
        }
    }


    // Add right ellipsis if needed
    // Condition: last page added is not (totalPages - 1)
    const lastPushedPageItem = items.slice().reverse().find(it => it.type === 'page');
    if (lastPushedPageItem && lastPushedPageItem.value < totalPages -1) {
         items.push({ type: 'ellipsis', value: -1, key: 'ellipsis-end'});
    }
    

    // Always show last page (if not already included and totalPages > 1)
    if (totalPages > 1 && !items.find(item => item.type === 'page' && item.value === totalPages)) {
      items.push({
        type: 'page',
        value: totalPages,
        key: `page-${totalPages}`
      });
    }
    
    // Deduplicate and sort 'page' items, ensuring ellipsis are not duplicated consecutively
    const finalItems: PaginationDisplayItem[] = [];
    let lastPushedType: 'page' | 'ellipsis' | null = null;
    const seenPageValues = new Set<number>();

    // Sort page items first to handle out-of-order additions from complex logic
    const pageItemsOnly = items.filter(item => item.type === 'page').sort((a,b) => a.value - b.value);
    const sortedItems: PaginationDisplayItem[] = [];
    
    let pageIdx = 0;
    for (const item of items) { // Iterate through original structure to try and keep ellipsis positions
        if (item.type === 'page') {
            // Find the corresponding sorted page item to insert
            // This is tricky. A simpler rebuild might be better.
            // Let's rebuild based on the simplified rules you provided:
        }
    }

    // Rebuild based on your "How the New Logic Works" description:
    // 1. Simple case (<=7 pages): Shows all page numbers (handled at the start)
    // 2. Complex case (>7 pages): Shows first page, ellipsis if needed, pages around current page, ellipsis if needed, last page
    const rebuiltItems: PaginationDisplayItem[] = [];
    rebuiltItems.push({ type: 'page', value: 1, key: 'page-1' });

    const rangeStart = Math.max(2, page - SIBLING_COUNT);
    const rangeEnd = Math.min(totalPages - 1, page + SIBLING_COUNT);

    if (rangeStart > 2) { // Ellipsis after first page
        rebuiltItems.push({ type: 'ellipsis', value: -1, key: 'ellipsis-start' });
    }

    for (let i = rangeStart; i <= rangeEnd; i++) {
        if (i > 1 && i < totalPages) { // Ensure it's not first or last
            rebuiltItems.push({ type: 'page', value: i, key: `page-${i}` });
        }
    }
    
    if (rangeEnd < totalPages - 1) { // Ellipsis before last page
        // Check if last added page is not totalPages -1 already
        const lastPageInRebuilt = rebuiltItems[rebuiltItems.length-1];
        if (lastPageInRebuilt.type !== 'page' || lastPageInRebuilt.value < totalPages -1) {
            rebuiltItems.push({ type: 'ellipsis', value: -1, key: 'ellipsis-end' });
        }
    }

    if (totalPages > 1) { // Add last page if not already there
        if(!rebuiltItems.find(it => it.type === 'page' && it.value === totalPages)) {
            rebuiltItems.push({ type: 'page', value: totalPages, key: `page-${totalPages}` });
        }
    }
    
    // Final cleanup for consecutive ellipsis or duplicate pages (should be less likely now)
    const cleanedItems: PaginationDisplayItem[] = [];
    let prevItem: PaginationDisplayItem | null = null;
    for (const item of rebuiltItems) {
        if (item.type === 'ellipsis' && prevItem?.type === 'ellipsis') {
            continue;
        }
        if (item.type === 'page' && prevItem?.type === 'page' && item.value === prevItem.value) {
            continue;
        }
        cleanedItems.push(item);
        prevItem = item;
    }

    return cleanedItems;
  };

  const paginationItemsToRender = generatePaginationItems();

  return (
    <div className="flex justify-center py-4">
      <Pagination>
        <PaginationContent>
          {/* Previous button */}
          {page > 1 && (
            <PaginationItem key="prev"> {/* Added key */}
              <PaginationPrevious
                href="#"
                onClick={(e) => handlePageChange(page - 1, e)}
                className="cursor-pointer"
              />
            </PaginationItem>
          )}

          {/* Page numbers and ellipsis */}
          {paginationItemsToRender.map((item) => {
            if (item.type === 'ellipsis') {
              return (
                <PaginationItem key={item.key}> {/* Using item.key */}
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            // item.type === 'page'
            const pageNumber = item.value;
            const isActive = page === pageNumber;
            
            return (
              <PaginationItem key={item.key}> {/* Using item.key */}
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
            <PaginationItem key="next"> {/* Added key */}
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
