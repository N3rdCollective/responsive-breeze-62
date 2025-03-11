
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Instagram, Twitter, Youtube, ExternalLink, Music } from "lucide-react";
import { FeaturedArtist as FeaturedArtistType } from "@/components/news/types/newsTypes";

interface FeaturedArtistProps {
  artist: FeaturedArtistType;
  className?: string;
}

const FeaturedArtist: React.FC<FeaturedArtistProps> = ({ artist, className = "" }) => {
  const defaultImage = "/placeholder.svg";
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="relative aspect-[16/9] md:aspect-[2/1] overflow-hidden bg-muted">
        <img 
          src={artist.image_url || defaultImage}
          alt={artist.name}
          className="h-full w-full object-cover object-center transition-all hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 md:p-6">
          <div className="flex items-center gap-1.5 text-white">
            <Music className="h-4 w-4" />
            <span className="text-sm font-medium">Featured Artist</span>
          </div>
          <h3 className="mt-1 text-xl md:text-2xl font-bold text-white">{artist.name}</h3>
        </div>
      </div>
      <CardContent className="p-4 md:p-6">
        <p className="line-clamp-3 text-muted-foreground text-sm">
          {artist.bio}
        </p>
        
        <div className="mt-4 flex flex-wrap gap-3">
          {artist.social_links?.instagram && (
            <a 
              href={artist.social_links.instagram} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <Instagram className="h-5 w-5" />
            </a>
          )}
          {artist.social_links?.twitter && (
            <a 
              href={artist.social_links.twitter} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <Twitter className="h-5 w-5" />
            </a>
          )}
          {artist.social_links?.youtube && (
            <a 
              href={artist.social_links.youtube} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <Youtube className="h-5 w-5" />
            </a>
          )}
          {artist.website && (
            <a 
              href={artist.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          )}
        </div>
        
        <div className="mt-6">
          <Link to={`/artists/${artist.id}`}>
            <Button className="w-full" variant="outline">
              View Artist Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturedArtist;
