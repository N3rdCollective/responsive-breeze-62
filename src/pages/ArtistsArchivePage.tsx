
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { FeaturedArtist as FeaturedArtistType } from "@/components/news/types/newsTypes";
import { Skeleton } from "@/components/ui/skeleton";
import FeaturedArtistComponent from "@/components/home/FeaturedArtist";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, History } from "lucide-react";

const ArtistsArchivePage = () => {
  const [archivedArtists, setArchivedArtists] = useState<FeaturedArtistType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArchivedArtists = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("featured_artists")
          .select("*")
          .eq("is_archived", true)
          .order("archived_at", { ascending: false });

        if (error) {
          console.error("Error fetching archived artists:", error);
          return;
        }

        setArchivedArtists(data as FeaturedArtistType[]);
      } catch (error) {
        console.error("Error fetching archived artists:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArchivedArtists();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold">Artist Archive</h1>
            <p className="text-muted-foreground mt-2">
              Browse our archive of past featured artists.
            </p>
          </div>
          <Link to="/artists">
            <Button variant="outline" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Featured Artists
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 gap-8">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="w-full h-80 rounded-lg" />
            ))}
          </div>
        ) : archivedArtists.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <History className="h-16 w-16 mx-auto text-muted-foreground/50" />
            <p className="text-xl text-muted-foreground">No archived artists found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12">
            {archivedArtists.map(artist => (
              <div key={artist.id} className="relative">
                <div className="absolute -top-6 left-0 bg-muted px-2 py-1 rounded text-xs flex items-center gap-1">
                  <History className="h-3 w-3" />
                  Archived: {new Date(artist.archived_at || "").toLocaleDateString()}
                </div>
                <FeaturedArtistComponent key={artist.id} artist={artist} />
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default ArtistsArchivePage;
