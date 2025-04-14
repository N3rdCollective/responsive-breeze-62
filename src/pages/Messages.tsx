
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MessageSidebar from "@/components/messages/MessageSidebar";
import MessageThread from "@/components/messages/MessageThread";
import EmptyState from "@/components/messages/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { useStaffAuth } from "@/hooks/useStaffAuth";

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoggedIn, user, isLoading: authLoading } = useStaffAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      toast({
        title: "Authentication required",
        description: "Please login to access the messaging feature",
        variant: "destructive",
      });
      navigate("/staff/login");
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn, authLoading, navigate, toast]);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8 flex">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full h-[calc(100vh-10rem)]">
          <div className="md:col-span-1 border-r dark:border-gray-700">
            <MessageSidebar />
          </div>
          <div className="md:col-span-2">
            {conversationId ? (
              <MessageThread conversationId={conversationId} />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Messages;
