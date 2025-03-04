
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

const defaultVideos: VideoData[] = [
  { id: "uaGvGnOiY04", title: "Aerial City View at Night" },
  { id: "j4Vg274kOvc", title: "Busy City Street Scene" },
  { id: "PNIBFEJ6UYc", title: "Urban Night Life" },
  { id: "5CqqZRXO7aM", title: "Downtown Buildings" },
  { id: "x06cnZm-Ic4", title: "City Skyline" },
];

interface VideoGalleryProps {
  videos?: VideoData[];
}

const VideoGallery: React.FC<VideoGalleryProps> = ({ videos = defaultVideos }) => {
  const [openVideoId, setOpenVideoId] = useState<string | null>(null);
  const [videoTitles, setVideoTitles] = useState<{[key: string]: string}>({});
  
  useEffect(() => {
    // Fetch video titles from YouTube (using API is preferred but requires a key)
    // For this implementation, we'll use oEmbed which doesn't require API keys
    const fetchVideoTitles = async () => {
      const titles: {[key: string]: string} = {};
      
      for (const video of videos) {
        try {
          const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${video.id}&format=json`);
          if (response.ok) {
            const data = await response.json();
            titles[video.id] = data.title;
          } else {
            titles[video.id] = video.title; // Fallback to our predefined title
          }
        } catch (error) {
          console.error(`Error fetching title for video ${video.id}:`, error);
          titles[video.id] = video.title; // Fallback to our predefined title
        }
      }
      
      setVideoTitles(titles);
    };
    
    fetchVideoTitles();
  }, [videos]);
  
  return (
    <section className="py-12 bg-gradient-to-b from-background to-muted dark:from-black/90 dark:to-black/95">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-foreground dark:text-white">Featured Videos</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {videos.map((video) => (
            <Dialog key={video.id} open={openVideoId === video.id} onOpenChange={(open) => {
              if (!open) setOpenVideoId(null);
            }}>
              <DialogTrigger asChild>
                <Card className="overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer bg-card dark:bg-black border-border dark:border-gray-800 group h-full">
                  <CardContent className="p-0 relative h-full flex flex-col">
                    <div className="relative aspect-video">
                      <img
                        src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                        alt={videoTitles[video.id] || video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to medium quality if mqdefault doesn't exist
                          (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
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
                        {videoTitles[video.id] || video.title}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-3xl dark:bg-black dark:border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-foreground dark:text-white">
                    {videoTitles[video.id] || video.title}
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
                    src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
                    title={videoTitles[video.id] || video.title}
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
