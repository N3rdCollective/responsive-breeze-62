
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { FeaturedArtist } from '@/components/news/types/newsTypes';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Instagram, Twitter, Youtube, Music } from 'lucide-react';

const ArtistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<FeaturedArtist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        setIsLoading(true);
        if (!id) return;

        const { data, error } = await supabase
          .from('featured_artists')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error("Error fetching artist:", error);
          return;
        }

        setArtist(data as FeaturedArtist);
      } catch (error) {
        console.error("Error in fetchArtist:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtist();
  }, [id]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-12 w-2/3 mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-6" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!artist) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Artist Not Found</h1>
          <p>Sorry, we couldn't find the artist you're looking for.</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={artist.image_url || "/placeholder.svg"}
                alt={artist.name}
                className="h-full w-full object-cover object-center"
              />
            </div>
            
            <div className="mt-6 flex flex-wrap gap-4">
              {artist.social_links?.instagram && (
                <a
                  href={artist.social_links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Instagram className="h-6 w-6" />
                </a>
              )}
              {artist.social_links?.twitter && (
                <a
                  href={artist.social_links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Twitter className="h-6 w-6" />
                </a>
              )}
              {artist.social_links?.youtube && (
                <a
                  href={artist.social_links.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Youtube className="h-6 w-6" />
                </a>
              )}
              {artist.social_links?.spotify && (
                <a
                  href={artist.social_links.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Music className="h-6 w-6" />
                </a>
              )}
              {artist.website && (
                <a
                  href={artist.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-6 w-6" />
                </a>
              )}
            </div>
          </div>
          
          <div className="md:w-2/3">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{artist.name}</h1>
            <div className="flex items-center gap-1.5 text-primary mb-6">
              <Music className="h-4 w-4" />
              <span className="text-sm font-medium">Featured Artist</span>
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-line">{artist.bio}</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ArtistDetail;
