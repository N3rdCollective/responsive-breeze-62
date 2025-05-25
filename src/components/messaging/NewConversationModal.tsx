
import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/types/profile';
import { useUserSearch } from '@/hooks/useUserSearch';
import { Loader2 } from 'lucide-react'; // For loading spinner

interface NewConversationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectUser: (userId: string) => void;
  currentUserId: string | undefined;
}

const NewConversationModal: React.FC<NewConversationModalProps> = ({
  isOpen,
  onOpenChange,
  onSelectUser,
  currentUserId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { users, isLoading, searchUsersByName } = useUserSearch();

  useEffect(() => {
    if (searchTerm.trim().length > 1 && currentUserId) {
      searchUsersByName(searchTerm, currentUserId);
    }
  }, [searchTerm, searchUsersByName, currentUserId]);

  const handleSelect = (userId: string) => {
    onSelectUser(userId);
    onOpenChange(false); // Close modal on selection
    setSearchTerm(''); // Reset search term
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start a new conversation</DialogTitle>
          <DialogDescription>Search for a user to start messaging.</DialogDescription>
        </DialogHeader>
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder="Search by username or display name..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {isLoading && (
              <div className="p-4 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLoading && searchTerm.trim().length > 1 && users.length === 0 && (
              <CommandEmpty>No users found.</CommandEmpty>
            )}
            {searchTerm.trim().length <= 1 && !isLoading && (
                <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>
            )}
            {users.length > 0 && !isLoading && (
              <CommandGroup heading="Users">
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => handleSelect(user.id)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || undefined} alt={user.display_name || user.username} />
                      <AvatarFallback>{(user.display_name || user.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.display_name || user.username}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); setSearchTerm(''); }}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewConversationModal;
