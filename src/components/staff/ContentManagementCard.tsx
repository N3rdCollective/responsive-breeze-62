
import { Newspaper, Home, Users, Radio } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface ContentManagementCardProps {
  userRole?: string;
}

export const ContentManagementCard = ({ userRole }: ContentManagementCardProps = {}) => {
  // Content managers, admins, and super_admins can manage news and featured videos
  const isAdmin = userRole === "admin" || userRole === "super_admin";
  const isContentManager = userRole === "content_manager" || isAdmin;
  const isModerator = userRole === "moderator" || isAdmin;
  
  // If not content manager, admin, or super_admin, don't show card
  if (!isContentManager && !isModerator) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Management</CardTitle>
        <CardDescription>Manage website content and features</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Link 
          to="/staff/news" 
          className="flex items-center p-3 hover:bg-accent rounded-md transition-colors"
        >
          <Newspaper className="h-5 w-5 mr-3 text-primary" />
          <div>
            <div className="font-medium">News & Articles</div>
            <div className="text-sm text-muted-foreground">Manage news posts and articles</div>
          </div>
        </Link>
        
        <Link 
          to="/staff/home" 
          className="flex items-center p-3 hover:bg-accent rounded-md transition-colors"
        >
          <Home className="h-5 w-5 mr-3 text-primary" />
          <div>
            <div className="font-medium">Homepage Content</div>
            <div className="text-sm text-muted-foreground">Edit featured items and homepage sections</div>
          </div>
        </Link>
        
        {/* Only show personalities and shows management to admins, super_admins and moderators */}
        {(isAdmin || isModerator) && (
          <>
            <Link 
              to="/staff/personalities" 
              className="flex items-center p-3 hover:bg-accent rounded-md transition-colors"
            >
              <Users className="h-5 w-5 mr-3 text-primary" />
              <div>
                <div className="font-medium">Personalities</div>
                <div className="text-sm text-muted-foreground">Manage radio personalities and DJs</div>
              </div>
            </Link>
            
            <Link 
              to="/staff/shows" 
              className="flex items-center p-3 hover:bg-accent rounded-md transition-colors"
            >
              <Radio className="h-5 w-5 mr-3 text-primary" />
              <div>
                <div className="font-medium">Radio Shows</div>
                <div className="text-sm text-muted-foreground">Manage show schedule and details</div>
              </div>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Add default export for backward compatibility
export default ContentManagementCard;
