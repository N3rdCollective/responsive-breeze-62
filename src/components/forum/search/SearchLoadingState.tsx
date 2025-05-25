
import React from 'react';
import { Loader2 } from 'lucide-react';

const SearchLoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin mb-4" />
      <p>Searching for topics...</p>
    </div>
  );
};

export default SearchLoadingState;

