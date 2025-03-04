
import React, { useState } from "react";
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

type VideoData = {
  id: string;
  title: string;
  credit?: string;
  thumbnail?: string;
};

const videos: VideoData[] = [
  { id: "uaGvGnOiY04", title: "Aerial City View at Night" },
  { id: "j4Vg274kOvc", title: "Busy City Street Scene" },
  { id: "PNIBFEJ6UYc", title: "Urban Night Life" },
  { id: "5CqqZRXO7aM", title: "Downtown Buildings" },
  { id: "x06cnZm-Ic4", title: "City Skyline" },
];

const VideoGallery = () => {
  const [openVideoId, setOpenVideoId] = useState<string | null>(null);
  
  return (
    <section className="py-16 bg-black/90">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-white">Featured Videos</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Dialog key={video.id} open={openVideoId === video.id} onOpenChange={(open) => {
              if (!open) setOpenVideoId(null);
            }}>
              <DialogTrigger asChild>
                <Card className="overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer bg-black border-gray-800 group">
                  <CardContent className="p-0 relative">
                    <div className="relative aspect-video">
                      <img
                        src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to medium quality if maxres doesn't exist
                          (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="rounded-full border-2 border-white bg-black/50 hover:bg-black/70"
                          onClick={() => setOpenVideoId(video.id)}
                        >
                          <Play className="h-6 w-6 text-white" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-900">
                      <h3 className="text-white font-medium truncate">{video.title}</h3>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-3xl bg-black border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-white">{video.title}</DialogTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-4 top-4 text-gray-400 hover:text-white"
                    onClick={() => setOpenVideoId(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogHeader>
                <div className="aspect-video w-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
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
