
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FeaturedArtist as FeaturedArtistType } from "@/components/news/types/newsTypes";
import { Skeleton } from "@/components/ui/skeleton";
import FeaturedArtistComponent from "@/components/home/FeaturedArtist";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import RelatedArtists from "@/components/artists/RelatedArtists";

const ArtistsPage = () => {
  const [artists, setArtists] = useState<FeaturedArtistType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("featured_artists")
          .select("*")
          .eq("is_archived", false)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching artists:", error);
          return;
        }

        // Skip the first 4 artists as they will be displayed in the RelatedArtists component
        setArtists(data.slice(4) as FeaturedArtistType[]);
      } catch (error) {
        console.error("Error fetching artists:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtists();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Featured Artists of the Month section */}
      <RelatedArtists />
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">All Featured Artists</h1>
          <Link to="/artists/archive">
            <Button variant="outline" className="gap-1">
              View Archive
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 gap-8">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="w-full h-80 rounded-lg" />
            ))}
          </div>
        ) : artists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No additional featured artists at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12">
            {artists.map(artist => (
              <FeaturedArtistComponent key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistsPage;
