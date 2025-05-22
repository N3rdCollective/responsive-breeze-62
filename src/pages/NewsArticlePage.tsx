
import React from 'react';
import { useParams } from 'react-router-dom';

const NewsArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">News Article #{id}</h1>
      <p>Individual news article content.</p>
    </div>
  );
};

export default NewsArticlePage;
