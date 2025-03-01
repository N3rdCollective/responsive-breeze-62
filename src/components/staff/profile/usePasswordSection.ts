
import { useState } from "react";

export interface UsePasswordSectionProps {
  initialPasswordSection?: boolean;
  onPasswordsChanged?: (passwords: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => void;
}

export const usePasswordSection = ({
  initialPasswordSection = false,
  onPasswordsChanged,
}: UsePasswordSectionProps = {}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(initialPasswordSection);

  // Update parent component whenever password fields change
  const handleCurrentPasswordChange = (value: string) => {
    setCurrentPassword(value);
    if (onPasswordsChanged) {
      onPasswordsChanged({
        currentPassword: value,
        newPassword,
        confirmPassword,
      });
    }
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    if (onPasswordsChanged) {
      onPasswordsChanged({
        currentPassword,
        newPassword: value,
        confirmPassword,
      });
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (onPasswordsChanged) {
      onPasswordsChanged({
        currentPassword,
        newPassword,
        confirmPassword: value,
      });
    }
  };

  const togglePasswordSection = () => {
    setShowPasswordSection(!showPasswordSection);
  };

  const resetPasswordFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordSection(false);
  };

  return {
    currentPassword,
    newPassword,
    confirmPassword,
    showPasswordSection,
    handleCurrentPasswordChange,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    togglePasswordSection,
    resetPasswordFields,
  };
};
