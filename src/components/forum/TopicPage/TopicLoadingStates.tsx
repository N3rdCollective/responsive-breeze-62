
import React from 'react';
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ForumTopic } from '@/types/forum';
import type { User } from '@supabase/supabase-js';

interface TopicLoadingStatesProps {
  authLoading: boolean;
  loadingData: boolean;
  user: User | null;
  topic: ForumTopic | null;
}

const TopicLoadingStates: React.FC<TopicLoadingStatesProps> = ({
  authLoading,
  loadingData,
  user,
  topic,
}) => {
  if (authLoading || (loadingData && !topic && user)) { // Check user to avoid showing loader if redirecting due to no user
    return (
      <div className="pt-24 pb-20 px-4 flex justify-center items-center min-h-[calc(100vh-var(--navbar-height))]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!topic && !loadingData && user) { // Only show "Topic not found" if user is present and not loading
    return (
      <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg font-medium mb-2">Topic not found</p>
            <p className="text-muted-foreground mb-4">
              The forum topic you're looking for might not exist or there was an issue loading it.
            </p>
            <Button asChild>
              <Link to="/members/forum">Back to Forum</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null; // If user is null (and not authLoading), parent component handles redirect
};

export default TopicLoadingStates;
