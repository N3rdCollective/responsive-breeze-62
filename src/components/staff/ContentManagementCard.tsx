
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, FileText, MusicIcon, UserSquare2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ContentManagementCardProps {
  userRole?: string;
}

const ContentManagementCard: React.FC<ContentManagementCardProps> = ({ userRole }) => {
  const navigate = useNavigate();
  
  // Check permissions for different content sections
  const canManageNews = userRole === "admin" || userRole === "moderator" || userRole === "staff" || userRole === "super_admin";
  const isModerator = userRole === "admin" || userRole === "moderator" || userRole === "super_admin";
  const isAdmin = userRole === "admin" || userRole === "super_admin";
  
  return (
    <Card className="bg-card border-border p-6 space-y-4">
      <h3 className="text-xl font-semibold text-foreground">Content Management</h3>
      <p className="text-muted-foreground">Manage website content and assets.</p>
      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full bg-background hover:bg-muted flex justify-start"
          onClick={() => navigate("/staff/home-editor")}
        >
          <FileText className="h-4 w-4 mr-2" />
          Home Page Content
        </Button>
        
        {canManageNews && (
          <Button 
            variant="outline" 
            className="w-full bg-background hover:bg-muted flex justify-start"
            onClick={() => navigate("/staff/news")}
          >
            <Newspaper className="h-4 w-4 mr-2" />
            News Management
          </Button>
        )}
        
        {isModerator && (
          <Button 
            variant="outline" 
            className="w-full bg-background hover:bg-muted flex justify-start"
            onClick={() => navigate("/staff/about-editor")}
          >
            <FileText className="h-4 w-4 mr-2" />
            About Page Content
          </Button>
        )}
        
        {isModerator && (
          <Button 
            variant="outline" 
            className="w-full bg-background hover:bg-muted flex justify-start"
            onClick={() => navigate("/staff/personalities")}
          >
            <UserSquare2 className="h-4 w-4 mr-2" />
            Personalities
          </Button>
        )}
        
        {isModerator && (
          <Button 
            variant="outline" 
            className="w-full bg-background hover:bg-muted flex justify-start"
            onClick={() => navigate("/staff/featured-artists")}
          >
            <MusicIcon className="h-4 w-4 mr-2" />
            Featured Artists
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ContentManagementCard;
