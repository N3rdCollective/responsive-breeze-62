
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, Film, Users, Music } from "lucide-react";

interface ContentManagementCardProps {
  userRole: string | null;
}

const ContentManagementCard = ({ userRole }: ContentManagementCardProps) => {
  const navigate = useNavigate();
  
  // Staff can manage news, moderators and admins can manage everything
  const canManageNews = userRole === "staff" || userRole === "moderator" || userRole === "admin" || userRole === "super_admin";
  const canManagePersonalities = userRole === "moderator" || userRole === "admin" || userRole === "super_admin";
  const canManageArtists = userRole === "moderator" || userRole === "admin" || userRole === "super_admin";
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Content Management</CardTitle>
        <CardDescription>Manage website content</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {canManageNews && (
          <Button onClick={() => navigate('/staff/news')} variant="outline" className="w-full justify-start gap-2">
            <FileText className="h-4 w-4" />
            Manage News Posts
          </Button>
        )}
        
        {canManagePersonalities && (
          <Button onClick={() => navigate('/staff/personalities')} variant="outline" className="w-full justify-start gap-2">
            <Users className="h-4 w-4" />
            Manage Personalities
          </Button>
        )}
        
        {canManageArtists && (
          <Button onClick={() => navigate('/staff/featured-artists')} variant="outline" className="w-full justify-start gap-2">
            <Music className="h-4 w-4" />
            Manage Featured Artists
          </Button>
        )}
        
        <Button onClick={() => navigate('/staff/home')} variant="outline" className="w-full justify-start gap-2">
          <Film className="h-4 w-4" />
          Manage Homepage
        </Button>
      </CardContent>
    </Card>
  );
};

export default ContentManagementCard;
