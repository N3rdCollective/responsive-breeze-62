
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react";
import { HomeSettingsProvider } from "@/components/staff/home/context/HomeSettingsContext";
import VideosTabContent from "@/components/staff/home/components/VideosTabContent";

const StaffVideosPage = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Featured Videos Management</h1>
        <p className="text-muted-foreground">
          Manage YouTube videos displayed in the Hero section and Featured Music Videos gallery
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Featured Videos Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage YouTube videos displayed in the Hero section and Featured Music Videos gallery.
          </p>
        </CardHeader>
        <CardContent>
          <HomeSettingsProvider>
            <VideosTabContent />
          </HomeSettingsProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffVideosPage;
