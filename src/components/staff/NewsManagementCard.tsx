
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Newspaper } from "lucide-react";

const NewsManagementCard = () => {
  const navigate = useNavigate();

  return (
    <Card className="bg-[#F5F5F5] dark:bg-[#333333] border-[#666666]/20 dark:border-white/10 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Newspaper className="h-6 w-6 text-black dark:text-[#FFD700]" />
        <h3 className="text-xl font-semibold text-black dark:text-[#FFD700]">News Management</h3>
      </div>
      
      <p className="text-gray-500 dark:text-gray-400">Create, edit and manage news posts for your website.</p>
      
      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
          onClick={() => navigate("/staff/news")}
        >
          Manage News Posts
        </Button>
      </div>
    </Card>
  );
};

export default NewsManagementCard;
