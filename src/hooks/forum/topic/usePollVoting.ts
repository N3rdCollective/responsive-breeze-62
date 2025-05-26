
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';

interface UsePollVotingParams {
  pollId: string | undefined | null;
  userId: string | undefined | null;
  onVoteSuccess: () => Promise<void> | void; // Callback to refresh data
}

export const usePollVoting = ({ pollId, userId, onVoteSuccess }: UsePollVotingParams) => {
  const [isVoting, setIsVoting] = useState(false);
  const { toast } = useToast();

  const handlePollVote = async (optionId: string) => {
    if (!pollId || !userId) {
      toast({
        title: "Cannot Vote",
        description: "Poll information or user session is missing.",
        variant: "destructive",
      });
      return;
    }

    setIsVoting(true);
    try {
      // Check if user has already voted for this poll by trying to fetch their vote for any option in this poll
      const { data: existingVotes, error: fetchError } = await supabase
        .from('forum_poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', userId)
        .limit(1);

      if (fetchError) {
        console.error('Error checking existing votes:', fetchError);
        // Allow voting attempt if fetch fails, RLS or DB constraint will catch double votes
      }
      
      if (existingVotes && existingVotes.length > 0) {
         toast({
          title: "Already Voted",
          description: "You have already cast your vote in this poll.",
          variant: "default",
        });
        setIsVoting(false);
        // Optionally refresh data here too, in case UI is out of sync
        await onVoteSuccess(); 
        return;
      }

      const { error } = await supabase
        .from('forum_poll_votes')
        .insert({
          poll_id: pollId,
          option_id: optionId,
          user_id: userId,
        });
        
      if (error) {
        // Handle unique constraint violation for (poll_id, user_id, option_id) if user somehow bypasses initial check
        // or if a single-choice poll requires a unique constraint on (poll_id, user_id)
        if (error.code === '23505') { // Unique violation
             toast({
                title: "Already Voted",
                description: "Your vote might have already been recorded.",
                variant: "default",
            });
        } else {
            throw error;
        }
      } else {
        toast({
          title: "Vote Recorded!",
          description: "Your vote has been successfully recorded.",
        });
      }
      
      await onVoteSuccess(); // Refresh topic data to show updated vote counts and user's vote
      
    } catch (error: any) {
      console.error('Error voting:', error);
      toast({
        title: "Voting Error",
        description: error.message || "Could not record your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };
  
  return { handlePollVote, isVoting };
};
