
import React from 'react';
import Navbar from '@/components/Navbar';
import ForumSearchBar from '@/components/forum/ForumSearchBar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForumInitiateSearchPage: React.FC = () => {
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

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Search Forum
          </h1>
          
          <ForumSearchBar />
        </div>
      </div>
    </div>
  );
};

export default ForumInitiateSearchPage;
