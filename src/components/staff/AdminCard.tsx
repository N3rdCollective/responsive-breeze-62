
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Users, LogOut, Box } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AdminCardProps {
  onManageStaff: () => void;
  onLogout: () => void;
}

const AdminCard = ({ onManageStaff, onLogout }: AdminCardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  return (
    <Card className="bg-card border-border p-6 space-y-4">
      <h3 className="text-xl font-semibold text-foreground">Administration</h3>
      <p className="text-muted-foreground">Manage users and system settings.</p>
      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full bg-background hover:bg-muted"
          onClick={onManageStaff}
        >
          <Users className="h-4 w-4 mr-2" />
          Manage Staff
        </Button>
        <Button 
          variant="outline" 
          className="w-full bg-background hover:bg-muted"
          onClick={() => navigate("/staff/sponsors")}
        >
          <Box className="h-4 w-4 mr-2" />
          Manage Sponsors
        </Button>
        <Button 
          variant="outline" 
          className="w-full bg-background hover:bg-muted"
          onClick={() => {
            toast({
              title: "System Settings",
              description: "This would open the system settings panel.",
            });
          }}
        >
          <ShieldCheck className="h-4 w-4 mr-2" />
          System Settings
        </Button>
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </Card>
  );
};

export default AdminCard;
