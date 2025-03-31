
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FeaturedArtist } from "@/components/news/types/newsTypes";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Music } from "lucide-react";

interface RelatedArtistsProps {
  currentArtistId?: string;
}

const RelatedArtists: React.FC<RelatedArtistsProps> = ({ currentArtistId }) => {
  const [featuredArtists, setFeaturedArtists] = useState<FeaturedArtist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedArtists = async () => {
      try {
        setIsLoading(true);
        
        // Fetch 5 artists in case one of them is the current artist
        let query = supabase
          .from("featured_artists")
          .select("*")
          .eq("is_archived", false)
          .order("created_at", { ascending: false })
          .limit(5);
          
        const { data, error } = await query;

        if (error) {
          console.error("Error fetching featured artists:", error);
          return;
        }

        // Filter out the current artist if it's in the results
        const filteredArtists = currentArtistId 
          ? data.filter((artist: FeaturedArtist) => artist.id !== currentArtistId) 
          : data;
        
        // Only take the top 4
        setFeaturedArtists(filteredArtists.slice(0, 4) as FeaturedArtist[]);
      } catch (error) {
        console.error("Error in fetchFeaturedArtists:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedArtists();
  }, [currentArtistId]);

  if (isLoading) {
    return (
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (featuredArtists.length === 0) {
    return null;
  }

  return (
    <div className="bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-xl font-bold mb-6">Featured Artists of the Month</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredArtists.map((artist) => (
            <Link to={`/artists/${artist.id}`} key={artist.id}>
              <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img 
                    src={artist.image_url || "/placeholder.svg"}
                    alt={artist.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-3">
                    <div className="flex items-center gap-1 text-white">
                      <Music className="h-3 w-3" />
                      <span className="text-xs font-medium">Featured Artist</span>
                    </div>
                    <h3 className="text-sm md:text-base font-bold text-white line-clamp-2">{artist.name}</h3>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedArtists;
