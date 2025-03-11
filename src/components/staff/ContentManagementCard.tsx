
import { Newspaper, Home, Users, Radio, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ROLE_PERMISSIONS } from "./manage-staff/types/pendingStaffTypes";

interface ContentManagementCardProps {
  userRole?: string;
}

export const ContentManagementCard = ({ userRole }: ContentManagementCardProps = {}) => {
  // Check if the user role has permission to manage content
  const hasContentAccess = !userRole || userRole === "super_admin" || 
                          userRole === "admin" || userRole === "moderator" || 
                          userRole === "content_manager" || userRole === "blogger";
  
  // Check if the user can manage all types of content
  const canManageAllContent = !userRole || 
                             (userRole && ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS]?.canManageAllContent);
  
  // Check if the user is a blogger (limited content access)
  const isBlogger = userRole === "blogger";
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Management</CardTitle>
        <CardDescription>Manage website content and features</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {(canManageAllContent || isBlogger) && (
          <Link 
            to="/staff/news" 
            className="flex items-center p-3 hover:bg-accent rounded-md transition-colors"
          >
            <Newspaper className="h-5 w-5 mr-3 text-primary" />
            <div>
              <div className="font-medium">News & Articles</div>
              <div className="text-sm text-muted-foreground">
                {isBlogger ? "Write and manage your blog posts" : "Manage news posts and articles"}
              </div>
            </div>
          </Link>
        )}
        
        {canManageAllContent && (
          <>
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
        
        {isBlogger && (
          <Link 
            to="/staff/bloggers-guide" 
            className="flex items-center p-3 hover:bg-accent rounded-md transition-colors"
          >
            <FileText className="h-5 w-5 mr-3 text-primary" />
            <div>
              <div className="font-medium">Blogger's Guide</div>
              <div className="text-sm text-muted-foreground">Guidelines and instructions for bloggers</div>
            </div>
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

// Add default export for backward compatibility
export default ContentManagementCard;
