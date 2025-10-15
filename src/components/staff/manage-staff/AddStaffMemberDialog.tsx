import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserSearch } from "@/hooks/useUserSearch";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Search } from "lucide-react";

interface AddStaffMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  currentUserRole: string;
}

export const AddStaffMemberDialog = ({ open, onOpenChange, onSuccess, currentUserRole }: AddStaffMemberDialogProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<{ id: string; username: string; display_name: string; avatar_url?: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("staff");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { users, isLoading, searchUsersByName } = useUserSearch();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.length >= 2) {
      searchUsersByName(value, "");
    }
  };

  const handleSelectUser = (user: typeof users[0]) => {
    setSelectedUser({
      id: user.id,
      username: user.username || "",
      display_name: user.display_name || user.username || "",
      avatar_url: user.avatar_url || undefined
    });
    setSearchTerm(user.display_name || user.username || "");
  };

  const handleSubmit = async () => {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive",
      });
      return;
    }

    // Prevent admins from creating super_admins
    if (currentUserRole === "admin" && selectedRole === "super_admin") {
      toast({
        title: "Error",
        description: "Admins cannot create super admins",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if user is already staff
      const { data: existingStaff, error: checkError } = await supabase
        .from("staff")
        .select("id")
        .eq("id", selectedUser.id)
        .single();

      if (existingStaff) {
        toast({
          title: "Error",
          description: "This user is already a staff member",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Get user email from profiles
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", selectedUser.id)
        .single();

      if (profileError || !profileData?.email) {
        toast({
          title: "Error",
          description: "Could not find user email",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Insert into staff table
      const { error: insertError } = await supabase
        .from("staff")
        .insert({
          id: selectedUser.id,
          email: profileData.email,
          role: selectedRole,
        });

      if (insertError) {
        console.error("Error adding staff member:", insertError);
        toast({
          title: "Error",
          description: insertError.message || "Failed to add staff member",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "Success",
        description: `${selectedUser.display_name} added as ${selectedRole}`,
      });

      // Reset form
      setSelectedUser(null);
      setSearchTerm("");
      setSelectedRole("staff");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error adding staff member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add staff member",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Staff Member
          </DialogTitle>
          <DialogDescription>
            Search for a user and assign them a staff role
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Search */}
          <div className="space-y-2">
            <Label htmlFor="user-search">Search User</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="user-search"
                placeholder="Search by username or display name..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Search Results */}
            {searchTerm.length >= 2 && users.length > 0 && !selectedUser && (
              <div className="border rounded-md max-h-48 overflow-y-auto">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        {user.display_name?.[0] || user.username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {user.display_name || user.username}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        @{user.username}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {isLoading && searchTerm.length >= 2 && (
              <div className="text-sm text-muted-foreground">Searching...</div>
            )}
          </div>

          {/* Selected User */}
          {selectedUser && (
            <div className="border rounded-md p-3 bg-accent/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedUser.avatar_url} />
                    <AvatarFallback>
                      {selectedUser.display_name[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedUser.display_name}</div>
                    <div className="text-sm text-muted-foreground">@{selectedUser.username}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedUser(null);
                    setSearchTerm("");
                  }}
                >
                  Change
                </Button>
              </div>
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Staff Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                {currentUserRole === "super_admin" && (
                  <>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </>
                )}
                {currentUserRole === "admin" && (
                  <SelectItem value="admin">Admin</SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {selectedRole === "staff" && "Basic staff access with limited permissions"}
              {selectedRole === "moderator" && "Can moderate content and manage users"}
              {selectedRole === "admin" && "Full access to most features"}
              {selectedRole === "super_admin" && "Complete system access"}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedUser || isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Staff Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
