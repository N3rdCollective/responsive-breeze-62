
import React from "react";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { UserCog } from "lucide-react";
import ProfileEditorContent from "./profile/ProfileEditorContent";
import { useProfileEditorState } from "./profile/useProfileEditorState";

interface StaffProfileEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StaffProfileEditor = ({ open, onOpenChange }: StaffProfileEditorProps) => {
  const {
    displayName,
    setDisplayName,
    email,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPasswordSection,
    setShowPasswordSection,
    isLoading,
    handleSaveProfile
  } = useProfileEditorState(open, onOpenChange);
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" /> 
            Edit Profile
          </SheetTitle>
        </SheetHeader>
        
        <ProfileEditorContent
          displayName={displayName}
          email={email}
          currentPassword={currentPassword}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          showPasswordSection={showPasswordSection}
          isLoading={isLoading}
          setDisplayName={setDisplayName}
          setCurrentPassword={setCurrentPassword}
          setNewPassword={setNewPassword}
          setConfirmPassword={setConfirmPassword}
          setShowPasswordSection={setShowPasswordSection}
          onCancel={() => onOpenChange(false)}
          onSave={handleSaveProfile}
        />
      </SheetContent>
    </Sheet>
  );
};

export default StaffProfileEditor;
