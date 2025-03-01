
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailFieldProps {
  value: string;
}

const EmailField = ({ value }: EmailFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        value={value}
        disabled={true}
        className="bg-muted"
      />
      <p className="text-xs text-muted-foreground">
        Email cannot be changed as it's linked to your account.
      </p>
    </div>
  );
};

export default EmailField;
