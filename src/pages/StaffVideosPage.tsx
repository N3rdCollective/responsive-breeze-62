
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react";
import { HomeSettingsProvider } from "@/components/staff/home/context/HomeSettingsContext";
import VideosTabContent from "@/components/staff/home/components/VideosTabContent";

const StaffVideosPage = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold">Featured Videos Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage YouTube videos displayed in the Hero section and Featured Music Videos gallery
        </p>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Video className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">Featured Videos Management</span>
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage YouTube videos displayed in the Hero section and Featured Music Videos gallery.
          </p>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <HomeSettingsProvider>
            <VideosTabContent />
          </HomeSettingsProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffVideosPage;
