
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useHomeSettings } from "../context/HomeSettingsContext";
import { useHomeSettingsData } from "../hooks/useHomeSettingsData";

const SectionsTabContent: React.FC = () => {
  const { settings } = useHomeSettings();
  const { handleToggle } = useHomeSettingsData();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="hero-toggle" className="font-medium">Hero Section</Label>
          <p className="text-sm text-muted-foreground">
            Hero section with radio station branding and call-to-action buttons
          </p>
        </div>
        <Switch 
          id="hero-toggle" 
          checked={settings.show_hero}
          onCheckedChange={() => handleToggle('show_hero')}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="live-banner-toggle" className="font-medium">Live Show Banner</Label>
          <p className="text-sm text-muted-foreground">
            Banner displaying currently playing show
          </p>
        </div>
        <Switch 
          id="live-banner-toggle" 
          checked={settings.show_live_banner}
          onCheckedChange={() => handleToggle('show_live_banner')}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="news-toggle" className="font-medium">News Section</Label>
          <p className="text-sm text-muted-foreground">
            Latest news articles from the blog
          </p>
        </div>
        <Switch 
          id="news-toggle" 
          checked={settings.show_news_section}
          onCheckedChange={() => handleToggle('show_news_section')}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="personalities-toggle" className="font-medium">Personalities Slider</Label>
          <p className="text-sm text-muted-foreground">
            Carousel of radio hosts and personalities
          </p>
        </div>
        <Switch 
          id="personalities-toggle" 
          checked={settings.show_personalities}
          onCheckedChange={() => handleToggle('show_personalities')}
        />
      </div>
    </div>
  );
};

export default SectionsTabContent;
