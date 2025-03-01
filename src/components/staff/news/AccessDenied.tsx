
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AccessDenied = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-destructive mb-4">Access Denied</h2>
      <p className="text-muted-foreground mb-6">You don't have permission to access this page.</p>
      <Button onClick={() => navigate('/staff-panel')}>
        Back to Staff Panel
      </Button>
    </div>
  );
};

export default AccessDenied;
