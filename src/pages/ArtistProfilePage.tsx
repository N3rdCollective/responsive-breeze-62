
import React from 'react';
import { useParams } from 'react-router-dom';

const ArtistProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Artist Profile #{id}</h1>
      <p>Artist information and music.</p>
    </div>
  );
};

export default ArtistProfilePage;
