
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const ShowManagementCard = () => {
  const { toast } = useToast();

  return (
    <Card className="bg-card border-border p-6 space-y-4">
      <h3 className="text-xl font-semibold text-foreground">Show Management</h3>
      <p className="text-muted-foreground">Manage radio shows and schedules.</p>
      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full bg-background hover: bg-muted"
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
          className="w-full bg-background hover:bg-muted"
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
          className="w-full bg-background hover:bg-muted"
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
