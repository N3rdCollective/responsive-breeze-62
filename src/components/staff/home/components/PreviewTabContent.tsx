
import React from "react";
import { useHomeSettings } from "../context/HomeSettingsContext";

const PreviewTabContent: React.FC = () => {
  const { settings } = useHomeSettings();

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-md">
        <h3 className="text-md font-medium mb-3">Current Homepage Preview</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Hero Section</span>
            <span className={settings.show_hero ? "text-green-500" : "text-red-500"}>
              {settings.show_hero ? "Visible" : "Hidden"}
            </span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Live Banner</span>
            <span className={settings.show_live_banner ? "text-green-500" : "text-red-500"}>
              {settings.show_live_banner ? "Visible" : "Hidden"}
            </span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">News Section</span>
            <span className={settings.show_news_section ? "text-green-500" : "text-red-500"}>
              {settings.show_news_section ? "Visible" : "Hidden"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Personalities Section</span>
            <span className={settings.show_personalities ? "text-green-500" : "text-red-500"}>
              {settings.show_personalities ? "Visible" : "Hidden"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewTabContent;
