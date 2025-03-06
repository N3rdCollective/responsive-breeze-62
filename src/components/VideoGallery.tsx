import React, { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoData } from "@/components/staff/home/context/HomeSettingsContext";
import { supabase } from "@/integrations/supabase/client";

interface VideoGalleryProps {
  videos?: VideoData[];
}

const VideoGallery: React.FC<VideoGalleryProps> = ({ videos }) => {
  const [openVideoId, setOpenVideoId] = useState<string | null>(null);
  const [galleryVideos, setGalleryVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchVideos = async () => {
      if (videos && videos.length > 0) {
        setGalleryVideos(videos);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("featured_videos")
          .select("*")
          .order("display_order", { ascending: true })
          .eq("is_active", true);

        if (error) throw error;
        setGalleryVideos(data || []);
      } catch (error) {
        console.error("Error fetching featured videos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [videos]);
  
  if (isLoading) {
    return (
      <section className="py-12 bg-gradient-to-b from-background to-muted dark:from-black/90 dark:to-black/95">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground dark:text-white">Featured Videos</h2>
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          </div>
        </div>
      </section>
    );
  }
  
  if (galleryVideos.length === 0) {
    return null; // Don't show section if no videos
  }
  
  return (
    <section className="py-12 bg-gradient-to-b from-background to-muted dark:from-black/90 dark:to-black/95">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-foreground dark:text-white">Featured Videos</h2>
        
        <div className="flex flex-wrap justify-center gap-4">
          {galleryVideos.map((video) => (
            <Dialog key={video.id} open={openVideoId === video.id} onOpenChange={(open) => {
              if (!open) setOpenVideoId(null);
            }}>
              <DialogTrigger asChild>
                <Card className="overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer bg-card dark:bg-black border-border dark:border-gray-800 group w-[160px] sm:w-[180px] md:w-[200px]">
                  <CardContent className="p-0 relative h-full flex flex-col">
                    <div className="relative aspect-video">
                      <img
                        src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="rounded-full border-2 border-white bg-black/50 hover:bg-black/70"
                          onClick={() => setOpenVideoId(video.id)}
                        >
                          <Play className="h-5 w-5 text-white" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-card dark:bg-gray-900 flex-grow flex items-center">
                      <h3 className="text-sm text-foreground dark:text-white font-medium line-clamp-2">
                        {video.title}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-3xl dark:bg-black dark:border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-foreground dark:text-white">
                    {video.title}
                  </DialogTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-4 top-4 text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-white"
                    onClick={() => setOpenVideoId(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogHeader>
                <div className="aspect-video w-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=1&rel=0&modestbranding=1`}
                    title={video.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoGallery;
