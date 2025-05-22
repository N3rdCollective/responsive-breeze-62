
import React from 'react';
import { useParams } from 'react-router-dom';

const PublicUserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">User Profile #{id}</h1>
      <p>Public user profile information.</p>
    </div>
  );
};

export default PublicUserProfilePage;
