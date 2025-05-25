
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare } from 'lucide-react'; // Changed to Plus
import { ForumCategory } from '@/types/forum'; // Use imported type
import { Badge } from '@/components/ui/badge'; // Added Badge import
import { Card, CardHeader, CardTitle } from '@/components/ui/card'; // Added Card imports

interface ForumCategoryHeaderProps {
  category: ForumCategory & { topic_count?: number; post_count?: number }; // Allow optional counts
  categorySlug?: string; // categorySlug is passed but not directly used for the link anymore
}

const ForumCategoryHeader: React.FC<ForumCategoryHeaderProps> = ({ category }) => {
  return (
    <Card className="mb-6 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              {category.name}
            </h1>
            {category.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">{category.description}</p>
            )}
            {(typeof category.topic_count !== 'undefined' || typeof category.post_count !== 'undefined') && (
              <div className="flex gap-2 sm:gap-4 mt-3">
                {typeof category.topic_count !== 'undefined' && (
                  <Badge variant="outline" className="text-xs sm:text-sm">
                    {category.topic_count} Topics
                  </Badge>
                )}
                {typeof category.post_count !== 'undefined' && (
                  <Badge variant="outline" className="text-xs sm:text-sm">
                    {category.post_count} Posts
                  </Badge>
                )}
              </div>
            )}
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90 text-sm sm:text-base shrink-0">
            {/* FIXED: Use category.id instead of categorySlug and correct route */}
            <Link to={`/forum/new-topic/${category.id}`}>
              <Plus className="h-4 w-4 mr-2" />
              New Topic
            </Link>
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};

export default ForumCategoryHeader;
