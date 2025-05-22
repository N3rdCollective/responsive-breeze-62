
import { useMemo } from 'react';

// Renamed interface to avoid conflicts if imported elsewhere, and to be specific to this hook's output
export interface PaginationDisplayItem {
  type: 'page' | 'ellipsis';
  value: number; // value is -1 for ellipsis, page number for 'page'
  key: string;
}

export const useForumPaginationItems = (page: number, totalPages: number): PaginationDisplayItem[] => {
  const paginationItems = useMemo(() : PaginationDisplayItem[] => {
    const items: PaginationDisplayItem[] = [];

    if (totalPages <= 1) {
      return []; // No items if not paginating
    }
    
    if (totalPages <= 7) {
      // Show all pages if we have 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        items.push({
          type: 'page',
          value: i,
          key: `page-${i}`
        });
      }
      return items;
    }

    // Always show first page
    items.push({
      type: 'page',
      value: 1,
      key: 'page-1'
    });

    // Calculate the range around current page
    // SIBLING_COUNT defines how many pages to show on each side of the current page.
    // Example: SIBLING_COUNT = 1 means [current-1, current, current+1]
    const SIBLING_COUNT = 1; 
    const pagesToShowAroundCurrent = SIBLING_COUNT * 2 + 1; // e.g., 3 for SIBLING_COUNT = 1

    // Determine if we need left ellipsis
    // Current page is far enough from the start to need an ellipsis after page 1
    // Page 1, ellipsis, page (page - SIBLING_COUNT)
    // So, if page - SIBLING_COUNT > 2 (i.e. page 1, page 2, ellipsis is not needed)
    const showLeftEllipsis = page - SIBLING_COUNT > 2;

    // Determine if we need right ellipsis
    // Current page is far enough from the end to need an ellipsis before the last page
    // Page (page + SIBLING_COUNT), ellipsis, Page totalPages
    // So, if page + SIBLING_COUNT < totalPages - 1
    const showRightEllipsis = page + SIBLING_COUNT < totalPages - 1;

    if (showLeftEllipsis) {
      items.push({
        type: 'ellipsis',
        value: -1, // Indicates ellipsis
        key: 'ellipsis-start'
      });
    }

    // Pages to show between ellipses (or page 1 / totalPages)
    let startPageRange: number;
    let endPageRange: number;

    if (!showLeftEllipsis && showRightEllipsis) {
      // Case: 1, 2, 3, 4, ..., N  (e.g. page is 1,2,3)
      // We show 1 (already added), then up to `pagesToShowAroundCurrent` (or a bit more to fill space)
      // If page is 1, we show 1, 2, 3. (sibling_count=1) => 1 + 1*2 = 3 pages
      // Max pages to show without ellipsis: 1, p-1,p,p+1, ellipsis, N (5 items if page is in middle)
      // Or 1,2,3,4,5,ellipsis,N (7 items for better look)
      // Let's target a fixed number of slots (around 5 page numbers + 2 ellipsis = 7 total items)
      // We have 1 ... p-1,p,p+1 ... N
      // Slots: first, (ellipsis1), page-1, page, page+1, (ellipsis2), last
      // If current page is close to start: e.g., page 3, total 20
      // We show 1, 2, 3, 4, ..., 20
      startPageRange = 2; // Page 1 is already added
      endPageRange = Math.min(totalPages -1, 1 + SIBLING_COUNT + (SIBLING_COUNT + 1 - (page - 1)));
      // This is a simplified approach: show up to 3-4 pages after page 1
      endPageRange = Math.min(totalPages - 1, 1 + SIBLING_COUNT * 2 + (page <= SIBLING_COUNT + 1 ? SIBLING_COUNT : 0) );
      endPageRange = Math.min(totalPages - 1, Math.max(page + SIBLING_COUNT, SIBLING_COUNT * 2 +1));


    } else if (showLeftEllipsis && !showRightEllipsis) {
      // Case: 1, ..., N-3, N-2, N-1, N (e.g. page is N, N-1, N-2)
      startPageRange = Math.max(2, totalPages - SIBLING_COUNT * 2 - (totalPages - page <= SIBLING_COUNT ? SIBLING_COUNT : 0) );
      startPageRange = Math.max(2, Math.min(page - SIBLING_COUNT, totalPages - SIBLING_COUNT * 2 -1));
      endPageRange = totalPages - 1; // Last page will be added separately

    } else if (showLeftEllipsis && showRightEllipsis) {
      // Case: 1, ..., P-1, P, P+1, ..., N
      startPageRange = page - SIBLING_COUNT;
      endPageRange = page + SIBLING_COUNT;
    } else { // No ellipsis on either side (means totalPages is small, handled by initial check)
             // Or we are near start and end simultaneously, means we show all middle pages.
      startPageRange = 2;
      endPageRange = totalPages - 1;
    }

    for (let i = startPageRange; i <= endPageRange; i++) {
       if (i > 1 && i < totalPages) { // Ensure it's not first or last, which are handled separately
        items.push({
          type: 'page',
          value: i,
          key: `page-${i}`
        });
      }
    }
    
    if (showRightEllipsis) {
       // Check if the last added page number is not already totalPages - 1
      const lastPageItem = items[items.length - 1];
      if (lastPageItem.type !== 'page' || lastPageItem.value < totalPages - 1) {
        items.push({
          type: 'ellipsis',
          value: -1, // Indicates ellipsis
          key: 'ellipsis-end'
        });
      }
    }

    // Always show last page (if not already included and totalPages > 1)
    // Ensure last page isn't already the last item if it's a page number
    const lastItem = items[items.length -1];
    if (totalPages > 1 && (lastItem.type !== 'page' || lastItem.value !== totalPages)) {
      items.push({
        type: 'page',
        value: totalPages,
        key: `page-${totalPages}`
      });
    }
    
    // Deduplicate just in case, though logic should prevent it.
    // Mainly to remove consecutive ellipsis or duplicate page numbers if logic gets complex.
    const finalItems: PaginationDisplayItem[] = [];
    let lastPushedType: 'page' | 'ellipsis' | null = null;
    const seenPageValues = new Set<number>();

    for (const item of items) {
        if (item.type === 'ellipsis') {
            if (lastPushedType === 'ellipsis') continue; // Skip consecutive ellipsis
            finalItems.push(item);
            lastPushedType = 'ellipsis';
        } else { // type is 'page'
            if (seenPageValues.has(item.value)) continue; // Skip duplicate page numbers
            finalItems.push(item);
            seenPageValues.add(item.value);
            lastPushedType = 'page';
        }
    }
    return finalItems;

  }, [page, totalPages]);

  return paginationItems;
};
