
import React from "react";
import { FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Instagram, Twitter, Youtube, Music } from "lucide-react";

interface SocialLinksSectionProps {
  spotifyValue: string;
  onSpotifyChange: (value: string) => void;
  instagramValue: string;
  onInstagramChange: (value: string) => void;
  twitterValue: string;
  onTwitterChange: (value: string) => void;
  youtubeValue: string;
  onYoutubeChange: (value: string) => void;
}

const SocialLinksSection: React.FC<SocialLinksSectionProps> = ({
  spotifyValue,
  onSpotifyChange,
  instagramValue,
  onInstagramChange,
  twitterValue,
  onTwitterChange,
  youtubeValue,
  onYoutubeChange
}) => {
  return (
    <div className="space-y-4">
      <FormItem>
        <FormLabel>Social Media Links</FormLabel>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Music className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Spotify URL"
              value={spotifyValue}
              onChange={(e) => onSpotifyChange(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Instagram className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Instagram URL"
              value={instagramValue}
              onChange={(e) => onInstagramChange(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Twitter className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Twitter URL"
              value={twitterValue}
              onChange={(e) => onTwitterChange(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Youtube className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="YouTube URL"
              value={youtubeValue}
              onChange={(e) => onYoutubeChange(e.target.value)}
            />
          </div>
        </div>
      </FormItem>
    </div>
  );
};

export default SocialLinksSection;
