
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DisplayNameFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const DisplayNameField = ({ value, onChange, disabled = false }: DisplayNameFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="displayName">Display Name</Label>
      <Input
        id="displayName"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="DJ Awesome"
        disabled={disabled}
      />
      <p className="text-xs text-muted-foreground">
        This is how your name will appear throughout the system and to the public.
      </p>
    </div>
  );
};

export default DisplayNameField;
