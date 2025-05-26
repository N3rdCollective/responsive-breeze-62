
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { ForumPoll } from '@/types/forum';
import { Button } from '@/components/ui/button'; // Assuming Button can be used or a simple button tag

interface PollDisplayProps {
  poll: ForumPoll;
  onVote: (optionId: string) => Promise<void>;
  currentUserId?: string | null;
  disabled?: boolean;
  isVoting?: boolean; // To disable while a vote is in progress
}

const PollDisplay: React.FC<PollDisplayProps> = ({ poll, onVote, currentUserId, disabled, isVoting }) => {
  if (!poll || !poll.options || poll.options.length === 0) {
    console.log("PollDisplay: No poll or options to display.", poll);
    return null;
  }
  console.log("PollDisplay: Rendering poll", poll);

  const totalVotes = poll.totalVotes || 0;
  // currentUserVote should be the ID of the option the user voted for, or null/undefined
  const userHasVoted = poll.currentUserVote !== null && poll.currentUserVote !== undefined;

  return (
    <div className="bg-card border dark:border-gray-700 rounded-lg p-4 sm:p-6 mb-6 shadow">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
        <BarChart3 className="h-5 w-5 text-primary" />
        {poll.question}
      </h3>
      
      <div className="space-y-3">
        {poll.options.map((option) => {
          const percentage = totalVotes > 0 ? (option.vote_count / totalVotes) * 100 : 0;
          const isSelectedByCurrentUser = poll.currentUserVote === option.id;
          
          return (
            <div key={option.id} className="space-y-1">
              <button
                onClick={() => {
                  if (!userHasVoted && !disabled && !isVoting && currentUserId) {
                    onVote(option.id);
                  }
                }}
                disabled={userHasVoted || disabled || isVoting || !currentUserId}
                className={`w-full text-left p-3 rounded-md border dark:border-gray-600 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  userHasVoted || disabled || isVoting || !currentUserId
                    ? 'cursor-not-allowed opacity-70' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer'
                } ${isSelectedByCurrentUser ? 'border-primary bg-primary/10 dark:bg-primary/20 ring-1 ring-primary' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm sm:text-base ${isSelectedByCurrentUser ? 'font-semibold text-primary dark:text-primary-light' : 'text-gray-700 dark:text-gray-300'}`}>
                    {option.option_text}
                  </span>
                  {userHasVoted && (
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {option.vote_count} votes ({percentage.toFixed(0)}%)
                    </span>
                  )}
                </div>
                
                {/* Progress bar shown after voting or if results are public */}
                {(userHasVoted || poll.ends_at) && ( // Assuming poll.ends_at means poll has ended and results are public. Adjust if needed.
                  <div className="mt-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-2.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        isSelectedByCurrentUser ? 'bg-primary' : 'bg-gray-400 dark:bg-gray-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-3 border-t dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
        Total votes: {totalVotes}
        {userHasVoted && currentUserId && (
          <span className="ml-3 text-green-600 dark:text-green-400 font-medium">✓ You voted</span>
        )}
         {!currentUserId && (
          <span className="ml-3 text-yellow-600 dark:text-yellow-400">Log in to vote</span>
        )}
      </div>
    </div>
  );
};

export default PollDisplay;
