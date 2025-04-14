
import { MessageCircle } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <MessageCircle className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
        Select a conversation from the sidebar or start a new conversation to begin messaging
      </p>
    </div>
  );
};

export default EmptyState;
