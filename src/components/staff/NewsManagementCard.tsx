
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Newspaper } from "lucide-react";

const NewsManagementCard = () => {
  return (
    <Card className="bg-[#F5F5F5] dark:bg-[#333333] border-[#666666]/20 dark:border-white/10 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Newspaper className="h-6 w-6 text-black dark:text-[#FFD700]" />
        <h3 className="text-xl font-semibold text-black dark:text-[#FFD700]">News Management</h3>
      </div>
      
      <p className="text-gray-500 dark:text-gray-400">This section has been integrated into Content Management.</p>
    </Card>
  );
};

export default NewsManagementCard;
