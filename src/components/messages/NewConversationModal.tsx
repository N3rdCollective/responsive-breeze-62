
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Search, User } from "lucide-react";

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StaffMember {
  id: string;
  email: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_picture: string | null;
}

const NewConversationModal = ({ isOpen, onClose }: NewConversationModalProps) => {
  const navigate = useNavigate();
  const { user } = useStaffAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [isStartingConversation, setIsStartingConversation] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchStaffMembers = async () => {
      if (!user?.id) return;

      try {
        setIsSearching(true);
        const { data, error } = await supabase
          .from("staff")
          .select("id, email, display_name, first_name, last_name, profile_picture")
          .neq("id", user.id);

        if (error) throw error;
        setStaffMembers(data);
        setFilteredStaff(data);
      } catch (error) {
        console.error("Error fetching staff members:", error);
        toast({
          title: "Error",
          description: "Failed to load staff members",
          variant: "destructive",
        });
      } finally {
        setIsSearching(false);
      }
    };

    fetchStaffMembers();
  }, [isOpen, user?.id, toast]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStaff(staffMembers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = staffMembers.filter(staff => 
      staff.email.toLowerCase().includes(query) ||
      (staff.display_name && staff.display_name.toLowerCase().includes(query)) ||
      (staff.first_name && staff.first_name.toLowerCase().includes(query)) ||
      (staff.last_name && staff.last_name.toLowerCase().includes(query))
    );
    setFilteredStaff(filtered);
  }, [searchQuery, staffMembers]);

  const startConversation = async (recipient: StaffMember) => {
    if (!user?.id) return;
    
    try {
      setIsStartingConversation(true);
      
      // Check if conversation already exists
      const participantIds = [user.id, recipient.id].sort();
      const { data: existingConv, error: checkError } = await supabase
        .from("conversations")
        .select("id")
        .eq("participant1_id", participantIds[0])
        .eq("participant2_id", participantIds[1])
        .maybeSingle();

      if (checkError) throw checkError;

      let conversationId;
      
      if (existingConv) {
        // Conversation exists, navigate to it
        conversationId = existingConv.id;
      } else {
        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from("conversations")
          .insert({
            participant1_id: participantIds[0],
            participant2_id: participantIds[1],
          })
          .select()
          .single();

        if (createError) throw createError;
        conversationId = newConv.id;
      }

      // Navigate to the conversation
      navigate(`/messages/${conversationId}`);
      onClose();
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    } finally {
      setIsStartingConversation(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Search staff members..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {isSearching ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500 dark:text-gray-400" />
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No staff members found
            </div>
          ) : (
            <div className="space-y-1 py-2">
              {filteredStaff.map((staff) => (
                <Button
                  key={staff.id}
                  variant="ghost"
                  className="w-full justify-start h-auto py-3"
                  onClick={() => startConversation(staff)}
                  disabled={isStartingConversation}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={staff.profile_picture || ""} />
                      <AvatarFallback>
                        {staff.display_name
                          ? staff.display_name.substring(0, 2).toUpperCase()
                          : staff.email.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-medium">
                        {staff.display_name || 
                         (staff.first_name && staff.last_name 
                          ? `${staff.first_name} ${staff.last_name}` 
                          : staff.email)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {staff.email}
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewConversationModal;
