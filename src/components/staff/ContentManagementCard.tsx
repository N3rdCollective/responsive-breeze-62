
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useStaffAuth } from "@/hooks/useStaffAuth";

const ContentManagementCard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userRole } = useStaffAuth();
  
  const isAdmin = userRole === "admin";
  const isModerator = userRole === "moderator";
  const isSuperAdmin = userRole === "super_admin";
  const canManageNews = isAdmin || isModerator || isSuperAdmin;

  const handleEditPage = (page: string) => {
    toast({
      title: `Edit ${page}`,
      description: `In a full implementation, this would open the editor for the ${page} page.`,
    });
  };

  return (
    <Card className="bg-[#F5F5F5] dark:bg-[#333333] border-[#666666]/20 dark:border-white/10 p-6 space-y-4">
      <h3 className="text-xl font-semibold text-black dark:text-[#FFD700]">Content Management</h3>
      <p className="text-gray-500 dark:text-gray-400">Edit website pages and manage content.</p>
      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
          onClick={() => handleEditPage("Home")}
        >
          Edit Home Page
        </Button>
        <Button 
          variant="outline" 
          className="w-full bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
          onClick={() => handleEditPage("About")}
        >
          Edit About Page
        </Button>
        <Button 
          variant="outline" 
          className="w-full bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
          onClick={() => navigate("/staff/news")}
          disabled={!canManageNews}
        >
          Manage News Posts
        </Button>
        <Button 
          variant="outline" 
          className="w-full bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
          onClick={() => handleEditPage("Personalities")}
        >
          Edit Personalities
        </Button>
      </div>
    </Card>
  );
};

export default ContentManagementCard;
