
import React from "react";
import { useHomeSettingsData } from "../hooks/useHomeSettingsData";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const SectionsTabContent: React.FC = () => {
  const { handleToggle, settings } = useHomeSettingsData();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-x-2">
        <div>
          <Label htmlFor="show-hero">Hero Section</Label>
          <p className="text-sm text-muted-foreground">
            The main banner at the top of the home page with a call to action
          </p>
        </div>
        <Switch
          id="show-hero"
          checked={settings.show_hero}
          onCheckedChange={() => handleToggle('show_hero')}
        />
      </div>
      
      <div className="flex items-center justify-between space-x-2">
        <div>
          <Label htmlFor="show-video-gallery">Featured Videos Section</Label>
          <p className="text-sm text-muted-foreground">
            Display a gallery of featured videos below the hero section
          </p>
        </div>
        <Switch
          id="show-video-gallery"
          checked={true}
          disabled
        />
      </div>
      
      <div className="flex items-center justify-between space-x-2">
        <div>
          <Label htmlFor="show-live-banner">Live Show Banner</Label>
          <p className="text-sm text-muted-foreground">
            Banner showing currently playing live show
          </p>
        </div>
        <Switch
          id="show-live-banner"
          checked={settings.show_live_banner}
          onCheckedChange={() => handleToggle('show_live_banner')}
        />
      </div>
      
      <div className="flex items-center justify-between space-x-2">
        <div>
          <Label htmlFor="show-news">News Section</Label>
          <p className="text-sm text-muted-foreground">
            Display recent news articles on the home page
          </p>
        </div>
        <Switch
          id="show-news"
          checked={settings.show_news_section}
          onCheckedChange={() => handleToggle('show_news_section')}
        />
      </div>
      
      <div className="flex items-center justify-between space-x-2">
        <div>
          <Label htmlFor="show-personalities">Personalities Slider</Label>
          <p className="text-sm text-muted-foreground">
            Display a carousel of radio personalities
          </p>
        </div>
        <Switch
          id="show-personalities"
          checked={settings.show_personalities}
          onCheckedChange={() => handleToggle('show_personalities')}
        />
      </div>
    </div>
  );
};

export default SectionsTabContent;
