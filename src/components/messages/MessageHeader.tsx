
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface MessageHeaderProps {
  participant: {
    id: string;
    email: string;
    display_name?: string | null;
    profile_picture?: string | null;
    last_active?: string | null;
  } | null;
  isLoading: boolean;
}

const MessageHeader = ({ participant, isLoading }: MessageHeaderProps) => {
  if (isLoading) {
    return (
      <div className="border-b dark:border-gray-700 p-4 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-6 w-40" />
      </div>
    );
  }

  return (
    <div className="border-b dark:border-gray-700 p-4 flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={participant?.profile_picture || ""} />
        <AvatarFallback>
          {participant?.display_name
            ? participant.display_name.substring(0, 2).toUpperCase()
            : participant?.email.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <h3 className="font-medium">
          {participant?.display_name || participant?.email}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {participant?.last_active 
            ? `Last active ${formatDistanceToNow(new Date(participant.last_active), { addSuffix: true })}` 
            : ""}
        </p>
      </div>
    </div>
  );
};

export default MessageHeader;
