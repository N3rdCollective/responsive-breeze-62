
import React from 'react';
import { SearchX } from 'lucide-react';

interface SearchErrorStateProps {
  errorMessage?: string;
}

const SearchErrorState: React.FC<SearchErrorStateProps> = ({ errorMessage }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-destructive">
      <SearchX className="h-8 w-8 mb-4" />
      <p>Could not fetch search results. {errorMessage ? `Error: ${errorMessage}` : 'Please try again.'}</p>
    </div>
  );
};

export default SearchErrorState;

