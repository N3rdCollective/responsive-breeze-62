
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const NewsHeader = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <div className="flex items-center mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/staff-panel')}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Staff Panel
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">News Management</h1>
          <p className="text-muted-foreground mt-1">Manage and publish news content for your website</p>
        </div>
        
        <Button 
          onClick={() => navigate("/staff/news/edit")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>
    </>
  );
};

export default NewsHeader;
