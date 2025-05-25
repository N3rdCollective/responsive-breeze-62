
import React from 'react';
import { format } from 'date-fns';
import { ForumTopic } from '@/types/forum';

interface FilterSummaryProps {
  query: string | null;
  byUser: string | null;
  categoryId: string | null;
  startDate: string | null;
  endDate: string | null;
  results?: ForumTopic[]; // Optional results to try and get category name
}

const FilterSummary: React.FC<FilterSummaryProps> = ({ query, byUser, categoryId, startDate, endDate, results }) => {
  const filters = [];
  if (query) filters.push(<span key="q">Term: <strong className="text-primary">{query}</strong></span>);
  if (byUser) filters.push(<span key="user">User: <strong className="text-primary">{byUser}</strong></span>);
  
  if (categoryId) {
    const catName = results?.find(r => r.category_id === categoryId)?.category?.name;
    if (catName) {
      filters.push(<span key="cat">Category: <strong className="text-primary">{catName}</strong></span>);
    } else {
      filters.push(<span key="cat">Category ID: <strong className="text-primary">{categoryId}</strong></span>);
    }
  }
  
  if (startDate) filters.push(<span key="sd">From: <strong className="text-primary">{format(new Date(startDate), "PPP")}</strong></span>);
  if (endDate) filters.push(<span key="ed">To: <strong className="text-primary">{format(new Date(endDate), "PPP")}</strong></span>);

  if (filters.length === 0) {
    return <p className="text-gray-700 dark:text-gray-300 mb-6">Please enter search criteria by starting a new search.</p>;
  }
  
  return (
    <div className="text-gray-700 dark:text-gray-300 mb-6">
      Showing results for: {filters.map((f,i) => <React.Fragment key={i}>{f}{i < filters.length -1 && ", "}</React.Fragment>)}
    </div>
  );
};

export default FilterSummary;

