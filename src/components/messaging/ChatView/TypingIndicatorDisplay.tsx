
import React from 'react';

interface TypingIndicatorDisplayProps {
  isTyping: boolean;
  userName: string | null;
}

const TypingIndicatorDisplay: React.FC<TypingIndicatorDisplayProps> = ({ isTyping, userName }) => {
  if (!isTyping) {
    return <div className="h-4 px-4 pb-1"></div>; // Placeholder to prevent layout jump
  }

  return (
    <div className="px-4 pb-1 text-xs text-muted-foreground italic h-4 animate-fade-in">
      {userName || 'Someone'} is typing...
    </div>
  );
};

export default TypingIndicatorDisplay;
