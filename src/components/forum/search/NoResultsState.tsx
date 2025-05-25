
import React from 'react';
import { SearchX } from 'lucide-react';

const NoResultsState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-muted-foreground">
      <SearchX className="h-8 w-8 mb-4" />
      <p>No topics found matching your search criteria.</p>
      <p className="text-sm mt-2">Try using different keywords or filters by starting a new search.</p>
    </div>
  );
};

export default NoResultsState;

