
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Archive } from "lucide-react";
import { FeaturedArtist } from "@/components/news/types/newsTypes";
import { cn } from "@/lib/utils";

interface ArtistListProps {
  artists: FeaturedArtist[];
  loading: boolean;
  onSelectArtist: (artist: FeaturedArtist) => void;
  selectedArtistId?: string;
  isArchived?: boolean;
}

const ArtistList: React.FC<ArtistListProps> = ({ 
  artists, 
  loading, 
  onSelectArtist, 
  selectedArtistId,
  isArchived = false
}) => {
  console.log("ArtistList rendering with:", { 
    artistCount: artists?.length, 
    loading, 
    selectedArtistId, 
    isArchived 
  });

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="cursor-pointer">
            <CardContent className="p-3 flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-md" />
              <Skeleton className="w-full h-6" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!artists || artists.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            {isArchived ? "No archived artists found" : "No artists found"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {artists.map((artist) => (
        <Card 
          key={artist.id}
          className={cn(
            "cursor-pointer transition-colors hover:bg-accent/50",
            selectedArtistId === artist.id && "bg-accent/50"
          )}
          onClick={() => onSelectArtist(artist)}
        >
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-md overflow-hidden flex-shrink-0">
              {artist.image_url ? (
                <img 
                  src={artist.image_url} 
                  alt={artist.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Archive className="h-4 w-4" />
                </div>
              )}
            </div>
            <div className="flex-1 truncate">
              <p className="font-medium truncate">{artist.name}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ArtistList;
