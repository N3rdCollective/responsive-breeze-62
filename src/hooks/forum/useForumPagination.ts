
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export const useForumPagination = (initialPage: number = 1) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page');
    const parsedPage = pageParam ? parseInt(pageParam, 10) : initialPage;
    return isNaN(parsedPage) || parsedPage < 1 ? initialPage : parsedPage;
  });

  // Sync URL changes with local page state
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const urlPage = pageParam ? parseInt(pageParam, 10) : 1; // Default to 1 if no param
    const validatedUrlPage = isNaN(urlPage) || urlPage < 1 ? 1 : urlPage;

    if (validatedUrlPage !== page) {
      setPage(validatedUrlPage);
    }
  }, [searchParams, page]); // page dependency helps avoid potential stale closure issues if effect re-runs due to other reasons

  // Function to update the page, which in turn updates URL search params
  const updatePageInUrl = useCallback((newPage: number) => {
    if (newPage < 1) return; // Basic validation

    // The actual state update (setPage) will be triggered by the useEffect above
    // when searchParams change.
    const newSearchParams = new URLSearchParams(searchParams);
    if (newPage === 1) {
      newSearchParams.delete('page');
    } else {
      newSearchParams.set('page', newPage.toString());
    }
    setSearchParams(newSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  return {
    page,
    setPage: updatePageInUrl, // This function updates the URL
  };
};
