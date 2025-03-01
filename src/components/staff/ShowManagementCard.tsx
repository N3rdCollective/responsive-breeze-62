
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const ShowManagementCard = () => {
  const { toast } = useToast();

  return (
    <Card className="bg-[#F5F5F5] dark:bg-[#333333] border-[#666666]/20 dark:border-white/10 p-6 space-y-4">
      <h3 className="text-xl font-semibold text-black dark:text-[#FFD700]">Show Management</h3>
      <p className="text-gray-500 dark:text-gray-400">Manage radio shows and schedules.</p>
      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
          onClick={() => {
            toast({
              title: "Schedule Management",
              description: "This would open the show schedule editor.",
            });
          }}
        >
          Manage Schedule
        </Button>
        <Button 
          variant="outline" 
          className="w-full bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
          onClick={() => {
            toast({
              title: "Playlist Management",
              description: "This would open the playlist editor.",
            });
          }}
        >
          Manage Playlists
        </Button>
        <Button 
          variant="outline" 
          className="w-full bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
          onClick={() => {
            toast({
              title: "Live Show Setup",
              description: "This would open the live show configuration.",
            });
          }}
        >
          Live Show Setup
        </Button>
      </div>
    </Card>
  );
};

export default ShowManagementCard;
