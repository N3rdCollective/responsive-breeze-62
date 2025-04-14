
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Search } from "lucide-react";
import NewConversationModal from "./NewConversationModal";

interface Conversation {
  id: string;
  participant: {
    id: string;
    email: string;
    display_name: string;
    profile_picture: string | null;
  };
  last_message: {
    content: string;
    timestamp: string;
    sender_id: string;
    status: string;
  } | null;
}

const MessageSidebar = () => {
  const { conversationId } = useParams();
  const { user } = useStaffAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("conversations")
          .select(`
            id,
            participant1_id,
            participant2_id,
            last_message_timestamp
          `)
          .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
          .order("last_message_timestamp", { ascending: false });

        if (error) throw error;

        // Fetch participant details and last message for each conversation
        const enhancedConversations = await Promise.all(
          data.map(async (conv) => {
            const otherParticipantId = conv.participant1_id === user.id 
              ? conv.participant2_id 
              : conv.participant1_id;

            // Get participant details
            const { data: participantData, error: participantError } = await supabase
              .from("staff")
              .select("id, email, display_name, profile_picture")
              .eq("id", otherParticipantId)
              .single();

            if (participantError) throw participantError;

            // Get last message
            const { data: messageData, error: messageError } = await supabase
              .from("messages")
              .select("content, timestamp, sender_id, status")
              .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherParticipantId}),and(sender_id.eq.${otherParticipantId},recipient_id.eq.${user.id})`)
              .order("timestamp", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (messageError) throw messageError;

            return {
              id: conv.id,
              participant: participantData,
              last_message: messageData,
            };
          })
        );

        setConversations(enhancedConversations);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();

    // Set up real-time subscription for conversations
    const conversationsSubscription = supabase
      .channel("realtime-conversations")
      .on("postgres_changes", 
        { 
          event: "*", 
          schema: "public", 
          table: "conversations",
          filter: `participant1_id=eq.${user?.id}|participant2_id=eq.${user?.id}` 
        }, 
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsSubscription);
    };
  }, [user?.id]);

  const filteredConversations = searchQuery 
    ? conversations.filter(conv => 
        conv.participant.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.participant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.last_message?.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const renderConversations = () => {
    if (isLoading) {
      return Array(5).fill(0).map((_, index) => (
        <div key={index} className="flex items-center gap-3 p-3 rounded-md">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ));
    }

    if (filteredConversations.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          {searchQuery ? "No matching conversations found" : "No conversations yet"}
        </div>
      );
    }

    return filteredConversations.map((conv) => (
      <Link
        key={conv.id}
        to={`/messages/${conv.id}`}
        className={`flex items-start gap-3 p-3 rounded-md hover:bg-accent/50 transition-colors ${
          conversationId === conv.id ? "bg-accent" : ""
        }`}
      >
        <Avatar className="h-12 w-12">
          <AvatarImage src={conv.participant.profile_picture || ""} />
          <AvatarFallback>
            {conv.participant.display_name
              ? conv.participant.display_name.substring(0, 2).toUpperCase()
              : conv.participant.email.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between">
            <h3 className="font-medium truncate">
              {conv.participant.display_name || conv.participant.email}
            </h3>
            {conv.last_message && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(conv.last_message.timestamp), { addSuffix: true })}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {conv.last_message
              ? `${conv.last_message.sender_id === user?.id ? "You: " : ""}${conv.last_message.content}`
              : "No messages yet"}
          </p>
        </div>
      </Link>
    ));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4">Messages</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Search conversations"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setIsModalOpen(true)}
            title="New conversation"
          >
            <PlusCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {renderConversations()}
      </div>
      <NewConversationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default MessageSidebar;
