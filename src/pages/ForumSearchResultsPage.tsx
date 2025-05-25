
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search } from 'lucide-react';
import ForumSearchResultItem from '@/components/forum/ForumSearchResultItem';
import { useForumSearch, FetchResultsParams } from '@/hooks/forum/useForumSearch';
import FilterSummary from '@/components/forum/search/FilterSummary';
import SearchLoadingState from '@/components/forum/search/SearchLoadingState';
import SearchErrorState from '@/components/forum/search/SearchErrorState';
import NoResultsState from '@/components/forum/search/NoResultsState';
import InitiateSearchMessage from '@/components/forum/search/InitiateSearchMessage';

const ForumSearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const byUser = searchParams.get('byUser');
  const categoryId = searchParams.get('category');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const searchFilters: FetchResultsParams = { query, byUser, categoryId, startDate, endDate };
  const hasActiveFilters = !!(query?.trim() || byUser?.trim() || categoryId?.trim() || startDate?.trim() || endDate?.trim());

  const { data: results, isLoading, isError, error: queryHookError } = useForumSearch(searchFilters);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <Button variant="outline" asChild>
              <Link to="/members/forum">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Forum
              </Link>
            </Button>
            <Button variant="default" asChild>
              <Link to="/forum/initiate-search">
                <Search className="mr-2 h-4 w-4" />
                New Search
              </Link>
            </Button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Forum Search Results
          </h1>
          
          <FilterSummary {...searchFilters} results={results} />

          <div className="mt-8">
            {isLoading && hasActiveFilters && <SearchLoadingState />}

            {isError && hasActiveFilters && <SearchErrorState errorMessage={queryHookError?.message} />}

            {!isLoading && !isError && hasActiveFilters && results && results.length > 0 && (
              <div className="space-y-4">
                {results.map((topic) => (
                  <ForumSearchResultItem key={topic.id} topic={topic} />
                ))}
              </div>
            )}

            {!isLoading && !isError && hasActiveFilters && results && results.length === 0 && (
              <NoResultsState />
            )}
            
            {!hasActiveFilters && !isLoading && <InitiateSearchMessage />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumSearchResultsPage;

