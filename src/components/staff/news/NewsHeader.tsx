
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NewsHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">News Management</h1>
        <p className="text-muted-foreground">Create, edit, and manage news posts</p>
      </div>
      
      <Button 
        onClick={() => navigate("/staff/news/new")} 
        className="flex items-center gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        New Post
      </Button>
    </div>
  );
};

export default NewsHeader;
