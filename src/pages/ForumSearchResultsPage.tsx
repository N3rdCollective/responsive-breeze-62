
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ForumSearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  // Placeholder for actual search logic and results display
  // For now, we'll just show the query.

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link to="/members/forum">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Forum
              </Link>
            </Button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Forum Search Results
          </h1>
          {query ? (
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Showing results for: <strong className="text-primary">{query}</strong>
            </p>
          ) : (
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Please enter a search term.
            </p>
          )}

          {/* Placeholder for search results list */}
          <div className="mt-8 p-6 bg-card rounded-lg shadow">
            <p className="text-muted-foreground text-center">
              Search results will appear here. (Implementation pending)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumSearchResultsPage;
