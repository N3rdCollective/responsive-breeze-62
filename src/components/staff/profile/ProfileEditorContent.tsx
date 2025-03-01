
import React from "react";
import { Button } from "@/components/ui/button";
import { SheetFooter } from "@/components/ui/sheet";
import DisplayNameField from "./DisplayNameField";
import EmailField from "./EmailField";
import PasswordSection from "./PasswordSection";

interface ProfileEditorContentProps {
  displayName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showPasswordSection: boolean;
  isLoading: boolean;
  setDisplayName: (value: string) => void;
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  setShowPasswordSection: (value: boolean) => void;
  onCancel: () => void;
  onSave: () => void;
}

const ProfileEditorContent = ({
  displayName,
  email,
  currentPassword,
  newPassword,
  confirmPassword,
  showPasswordSection,
  isLoading,
  setDisplayName,
  setCurrentPassword,
  setNewPassword,
  setConfirmPassword,
  setShowPasswordSection,
  onCancel,
  onSave
}: ProfileEditorContentProps) => {
  return (
    <>
      <div className="space-y-6 py-6">
        <div className="space-y-4">
          <DisplayNameField
            value={displayName}
            onChange={setDisplayName}
            disabled={isLoading}
          />
          
          <EmailField value={email} />
          
          <PasswordSection
            currentPassword={currentPassword}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            showPasswordSection={showPasswordSection}
            setCurrentPassword={setCurrentPassword}
            setNewPassword={setNewPassword}
            setConfirmPassword={setConfirmPassword}
            setShowPasswordSection={setShowPasswordSection}
            disabled={isLoading}
          />
        </div>
      </div>
      
      <SheetFooter className="flex space-x-2 sm:space-x-0">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          onClick={onSave}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </SheetFooter>
    </>
  );
};

export default ProfileEditorContent;
