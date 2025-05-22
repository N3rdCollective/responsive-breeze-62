import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import FeaturedArtist from "./FeaturedArtist";
import { FeaturedArtist as FeaturedArtistType } from "@/components/news/types/newsTypes";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const FeaturedArtistSection: React.FC = () => {
  const [featuredArtists, setFeaturedArtists] = useState<FeaturedArtistType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Added error state

  useEffect(() => {
    const fetchFeaturedArtists = async () => {
      try {
        setIsLoading(true);
        setError(null); // Reset error state on new fetch
        const { data, error: supabaseError } = await supabase
          .from("featured_artists")
          .select("*")
          .eq("is_archived", false)
          .order("created_at", { ascending: false })
          .limit(4);

        if (supabaseError) {
          console.error("Error fetching featured artists:", supabaseError);
          setError("Failed to load featured artists. Please try again later."); // Set error message
          return;
        }

        setFeaturedArtists(data as FeaturedArtistType[]);
      } catch (err) {
        console.error("Error in fetchFeaturedArtists:", err);
        setError("An unexpected error occurred while fetching artists."); // Set generic error message
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedArtists();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Artists</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="w-full h-80 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) { // Added error display block
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Artists</h2>
        </div>
        <div className="flex flex-col items-center justify-center text-center bg-destructive/10 p-8 rounded-lg border border-destructive/30">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-semibold text-destructive mb-2">Oops! Something went wrong.</h3>
          <p className="text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }

  if (!featuredArtists.length) {
    // Optionally, you could show a "No artists to display" message here instead of null
    // For now, keeping original behavior if no error and no artists.
    return null; 
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured Artists</h2>
        <div className="flex gap-2">
          <Link to="/artists">
            <Button variant="ghost" className="gap-1">
              View All Artists
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/artists/archive">
            <Button variant="ghost" className="gap-1">
              View Archive
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredArtists.map((artist) => (
          <FeaturedArtist key={artist.id} artist={artist} />
        ))}
      </div>

      {/* Mobile carousel */}
      <div className="md:hidden">
        <Carousel className="w-full">
          <CarouselContent>
            {featuredArtists.map((artist) => (
              <CarouselItem key={artist.id} className="basis-full md:basis-1/2 lg:basis-1/4">
                <FeaturedArtist artist={artist} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-4">
            <CarouselPrevious className="relative static translate-y-0 mx-2" />
            <CarouselNext className="relative static translate-y-0 mx-2" />
          </div>
        </Carousel>
      </div>
    </div>
  );
};

export default FeaturedArtistSection;
