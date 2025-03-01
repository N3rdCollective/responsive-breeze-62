
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { usePasswordSection } from "./usePasswordSection";

interface PasswordSectionProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showPasswordSection: boolean;
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  setShowPasswordSection: (value: boolean) => void;
  disabled?: boolean;
}

const PasswordSection = ({
  currentPassword,
  newPassword,
  confirmPassword,
  showPasswordSection,
  setCurrentPassword,
  setNewPassword,
  setConfirmPassword,
  setShowPasswordSection,
  disabled = false
}: PasswordSectionProps) => {
  // Pass through to the hook for backward compatibility
  const passwordManager = usePasswordSection({
    initialPasswordSection: showPasswordSection,
    onPasswordsChanged: ({ currentPassword, newPassword, confirmPassword }) => {
      setCurrentPassword(currentPassword);
      setNewPassword(newPassword);
      setConfirmPassword(confirmPassword);
    },
  });

  // Toggle password section in both the local hook and parent component
  const handleToggleSection = () => {
    passwordManager.togglePasswordSection();
    setShowPasswordSection(!showPasswordSection);
  };

  return (
    <>
      <div className="pt-2">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
          onClick={handleToggleSection}
          disabled={disabled}
        >
          <Lock className="h-4 w-4" />
          {showPasswordSection ? "Hide Password Section" : "Change Password"}
        </Button>
      </div>
      
      {showPasswordSection && (
        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              disabled={disabled}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              disabled={disabled}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PasswordSection;
