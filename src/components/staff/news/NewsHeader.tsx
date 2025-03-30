
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NewsHeaderProps {
  title?: string;
  staffName?: string;
  isAdmin?: boolean;
}

const NewsHeader: React.FC<NewsHeaderProps> = ({ 
  title = "News Management", 
  staffName,
  isAdmin = false 
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
      <div>
        <h1 className="text-2xl font-bold mb-1">{title}</h1>
        <p className="text-muted-foreground">Create, edit, and manage news posts</p>
        
        {staffName && (
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-500 dark:text-gray-400">
              Logged in as: {staffName}
            </p>
            {isAdmin && (
              <div className="flex items-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full text-xs">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Administrator
              </div>
            )}
          </div>
        )}
      </div>
      
      <Button 
        onClick={() => navigate("/staff/news/editor")} 
        className="flex items-center gap-2 mt-4 sm:mt-0"
      >
        <PlusCircle className="h-4 w-4" />
        New Post
      </Button>
    </div>
  );
};

export default NewsHeader;
