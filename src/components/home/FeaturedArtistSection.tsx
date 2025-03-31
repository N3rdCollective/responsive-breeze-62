
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import FeaturedArtist from "./FeaturedArtist";
import { FeaturedArtist as FeaturedArtistType } from "@/components/news/types/newsTypes";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const FeaturedArtistSection: React.FC = () => {
  const [featuredArtist, setFeaturedArtist] = useState<FeaturedArtistType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedArtist = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("featured_artists")
          .select("*")
          .eq("is_archived", false)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error("Error fetching featured artist:", error);
          return;
        }

        setFeaturedArtist(data as FeaturedArtistType);
      } catch (error) {
        console.error("Error in fetchFeaturedArtist:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedArtist();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Artist</h2>
        </div>
        <Skeleton className="w-full h-80 rounded-lg" />
      </div>
    );
  }

  if (!featuredArtist) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured Artist</h2>
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
      <FeaturedArtist artist={featuredArtist} />
    </div>
  );
};

export default FeaturedArtistSection;
