
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
    <Card className="bg-[#F5F5F5] dark:bg-[#333333] border-[#666666]/20 dark:border-white/10 p-6 space-y-4">
      <h3 className="text-xl font-semibold text-black dark:text-[#FFD700]">Administration</h3>
      <p className="text-gray-500 dark:text-gray-400">Manage users and system settings.</p>
      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
          onClick={onManageStaff}
        >
          <Users className="h-4 w-4 mr-2" />
          Manage Staff
        </Button>
        <Button 
          variant="outline" 
          className="w-full bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
          onClick={() => navigate("/staff/sponsors")}
        >
          <Box className="h-4 w-4 mr-2" />
          Manage Sponsors
        </Button>
        <Button 
          variant="outline" 
          className="w-full bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
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
          className="w-full bg-red-500/90 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
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
