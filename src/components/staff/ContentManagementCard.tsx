
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
  const canManageContent = isAdmin || isModerator || isSuperAdmin;

  const handleEditPage = (page: string) => {
    if (page === "About") {
      navigate("/staff/about-editor");
    } else if (page === "Home") {
      navigate("/staff/home-editor");
    } else {
      toast({
        title: `Edit ${page}`,
        description: `In a full implementation, this would open the editor for the ${page} page.`,
      });
    }
  };

  return (
    <Card className="bg-card border-border p-6 space-y-4">
      <h3 className="text-xl font-semibold text-foreground">Content Management</h3>
      <p className="text-muted-foreground">Edit website pages and manage content.</p>
      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full bg-background hover:bg-muted"
          onClick={() => handleEditPage("Home")}
          disabled={!canManageContent}
        >
          Edit Home Page
        </Button>
        <Button 
          variant="outline" 
          className="w-full bg-background hover:bg-muted"
          onClick={() => handleEditPage("About")}
          disabled={!canManageContent}
        >
          Edit About Page
        </Button>
        <Button 
          variant="outline" 
          className="w-full bg-background hover:bg-muted"
          onClick={() => navigate("/staff/news")}
          disabled={!canManageNews}
        >
          Manage News Posts
        </Button>
        <Button 
          variant="outline" 
          className="w-full bg-background hover:bg-muted"
          onClick={() => navigate("/staff/personalities")}
          disabled={!canManageContent}
        >
          Edit Personalities
        </Button>
      </div>
    </Card>
  );
};

export default ContentManagementCard;
