
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface AccessDeniedProps {
  message?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ 
  message = "You don't have permission to access this page" 
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-destructive mb-4">Access Denied</h2>
      <p className="text-muted-foreground mb-6">{message}</p>
      <Button onClick={() => navigate('/staff')}>
        Back to Staff Panel
      </Button>
    </div>
  );
};

export default AccessDenied;
