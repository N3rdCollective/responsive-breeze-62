
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface SocialLinksSectionProps {
  spotifyValue: string;
  instagramValue: string;
  twitterValue: string;
  youtubeValue: string;
  onSpotifyChange: (value: string) => void;
  onInstagramChange: (value: string) => void;
  onTwitterChange: (value: string) => void;
  onYoutubeChange: (value: string) => void;
  disabled?: boolean;
}

const SocialLinksSection: React.FC<SocialLinksSectionProps> = ({
  spotifyValue,
  instagramValue,
  twitterValue,
  youtubeValue,
  onSpotifyChange,
  onInstagramChange,
  onTwitterChange,
  onYoutubeChange,
  disabled = false
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Social Media Links</h3>
        <Separator className="mb-4" />
      </div>
      
      <FormItem>
        <FormLabel>Spotify</FormLabel>
        <FormControl>
          <Input
            value={spotifyValue}
            onChange={(e) => onSpotifyChange(e.target.value)}
            placeholder="https://open.spotify.com/artist/..."
            disabled={disabled}
          />
        </FormControl>
      </FormItem>
      
      <FormItem>
        <FormLabel>Instagram</FormLabel>
        <FormControl>
          <Input
            value={instagramValue}
            onChange={(e) => onInstagramChange(e.target.value)}
            placeholder="https://instagram.com/..."
            disabled={disabled}
          />
        </FormControl>
      </FormItem>
      
      <FormItem>
        <FormLabel>Twitter</FormLabel>
        <FormControl>
          <Input
            value={twitterValue}
            onChange={(e) => onTwitterChange(e.target.value)}
            placeholder="https://twitter.com/..."
            disabled={disabled}
          />
        </FormControl>
      </FormItem>
      
      <FormItem>
        <FormLabel>YouTube</FormLabel>
        <FormControl>
          <Input
            value={youtubeValue}
            onChange={(e) => onYoutubeChange(e.target.value)}
            placeholder="https://youtube.com/..."
            disabled={disabled}
          />
        </FormControl>
      </FormItem>
    </div>
  );
};

export default SocialLinksSection;
