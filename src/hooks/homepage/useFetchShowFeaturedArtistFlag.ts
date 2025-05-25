
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseFetchShowFeaturedArtistFlagReturn {
  showFeaturedArtist: boolean;
  isLoading: boolean;
}

export const useFetchShowFeaturedArtistFlag = (): UseFetchShowFeaturedArtistFlagReturn => {
  const [showFeaturedArtist, setShowFeaturedArtist] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFeaturedArtists = async () => {
      setIsLoading(true);
      try {
        const { data: artistsData, error: artistsError } = await supabase
          .from("featured_artists")
          .select("id")
          .limit(1);

        if (artistsError) {
          console.error("Error checking featured artists:", artistsError);
          setShowFeaturedArtist(false);
        } else {
          setShowFeaturedArtist(artistsData && artistsData.length > 0);
        }
      } catch (error) {
        console.error("Error in checkFeaturedArtists:", error);
        setShowFeaturedArtist(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkFeaturedArtists();
  }, []);

  return { showFeaturedArtist, isLoading };
};
