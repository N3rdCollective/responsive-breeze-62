
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, X, Move } from "lucide-react";
import { useHomeSettings } from "../context/HomeSettingsContext";
import { VideoData } from "../context/HomeSettingsContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const VideosTabContent: React.FC = () => {
  const { featuredVideos, setFeaturedVideos } = useHomeSettings();
  const { toast } = useToast();
  const [newVideoId, setNewVideoId] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [errorVideoId, setErrorVideoId] = useState("");

  const handleUpdateVideoField = (index: number, field: keyof VideoData, value: string | number | boolean) => {
    setFeaturedVideos(prev => {
      const updatedVideos = [...prev];
      updatedVideos[index] = { ...updatedVideos[index], [field]: value };
      return updatedVideos;
    });
  };

  const handleRemoveVideo = async (index: number) => {
    const videoToRemove = featuredVideos[index];
    
    // If the video has an ID, mark it as inactive instead of removing from state
    if (videoToRemove.id) {
      try {
        const { error } = await supabase
          .from("featured_videos")
          .update({ is_active: false })
          .eq("id", videoToRemove.id);
          
        if (error) throw error;
        
        // Remove from local state
        setFeaturedVideos(prev => prev.filter((_, i) => i !== index));
        
        toast({
          title: "Video removed",
          description: "The video has been removed from the featured list",
        });
      } catch (error) {
        console.error("Error removing video:", error);
        toast({
          title: "Error",
          description: "Failed to remove video",
          variant: "destructive",
        });
      }
    } else {
      // If it's a new video not yet saved to the database, just remove from state
      setFeaturedVideos(prev => prev.filter((_, i) => i !== index));
      toast({
        title: "Video removed",
        description: "The video has been removed from the featured list",
      });
    }
  };

  const validateAndAddVideo = async () => {
    if (!newVideoId.trim()) {
      setErrorVideoId("Please enter a YouTube video ID");
      return;
    }

    // YouTube ID validation regex
    const youtubeIdRegex = /^[a-zA-Z0-9_-]{11}$/;
    if (!youtubeIdRegex.test(newVideoId)) {
      setErrorVideoId("Please enter a valid YouTube video ID (11 characters)");
      return;
    }

    setIsValidating(true);
    setErrorVideoId("");

    try {
      // Fetch video info from YouTube's oEmbed API
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${newVideoId}&format=json`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Create a new video in the database with the YouTube-provided title
        const { data: newVideo, error } = await supabase
          .from("featured_videos")
          .insert({
            youtube_id: newVideoId,
            title: data.title,
            display_order: featuredVideos.length + 1,
            is_active: true
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Add to local state
        setFeaturedVideos(prev => [...prev, newVideo]);
        
        setNewVideoId("");
        toast({
          title: "Video added",
          description: `Added "${data.title}" to featured videos`,
        });
      } else {
        setErrorVideoId("Could not find a valid YouTube video with this ID");
      }
    } catch (error) {
      console.error("Error validating YouTube video:", error);
      setErrorVideoId("Error validating video. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const moveVideo = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === featuredVideos.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    setFeaturedVideos(prev => {
      const videos = [...prev];
      
      // Update display order in the array
      const temp = videos[index].display_order;
      videos[index].display_order = videos[newIndex].display_order;
      videos[newIndex].display_order = temp;
      
      // Swap positions in the array
      [videos[index], videos[newIndex]] = [videos[newIndex], videos[index]];
      
      return videos;
    });
  };

  // Function to update a video's title from YouTube based on its ID
  const refreshVideoTitle = async (index: number) => {
    const video = featuredVideos[index];
    setIsValidating(true);
    
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${video.youtube_id}&format=json`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Update in database
        const { error } = await supabase
          .from("featured_videos")
          .update({ title: data.title })
          .eq("id", video.id);
          
        if (error) throw error;
        
        // Update in local state
        handleUpdateVideoField(index, 'title', data.title);
        
        toast({
          title: "Title updated",
          description: `Updated title to "${data.title}"`,
        });
      } else {
        toast({
          title: "Error",
          description: "Could not fetch video information from YouTube",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error refreshing video title:", error);
      toast({
        title: "Error",
        description: "Failed to update video title",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-col space-y-1.5">
          <h3 className="text-lg font-semibold">Manage Featured Videos</h3>
          <p className="text-sm text-muted-foreground">
            Add, remove, or edit YouTube videos shown in the Hero section and Featured Videos gallery
          </p>
        </div>

        <Card>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {featuredVideos.map((video, index) => (
                <div key={`${video.id}-${index}`} className="flex flex-col gap-2 p-3 border rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img 
                        src={`https://img.youtube.com/vi/${video.youtube_id}/default.jpg`} 
                        alt={video.title} 
                        className="w-16 h-12 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      <span className="font-medium">{video.title}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveVideo(index, 'up')}
                        disabled={index === 0}
                        className="h-8 w-8"
                      >
                        <Move className="h-4 w-4 rotate-90" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveVideo(index, 'down')}
                        disabled={index === featuredVideos.length - 1}
                        className="h-8 w-8"
                      >
                        <Move className="h-4 w-4 -rotate-90" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => refreshVideoTitle(index)}
                        title="Refresh title from YouTube"
                        className="h-8 w-8"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveVideo(index)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`video-id-${index}`}>YouTube Video ID</Label>
                    <Input
                      id={`video-id-${index}`}
                      value={video.youtube_id}
                      className="mt-1"
                      onChange={(e) => handleUpdateVideoField(index, 'youtube_id', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`video-title-${index}`} className="flex items-center gap-1">
                      Title
                      <span className="text-xs text-muted-foreground font-normal">(Auto-fetched from YouTube)</span>
                    </Label>
                    <Input
                      id={`video-title-${index}`}
                      value={video.title}
                      className="mt-1"
                      onChange={(e) => handleUpdateVideoField(index, 'title', e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <div className="border border-dashed rounded-md p-4">
                <h4 className="font-medium mb-2">Add New Video</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="new-video-id">YouTube Video ID</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="new-video-id"
                        value={newVideoId}
                        onChange={(e) => {
                          setNewVideoId(e.target.value);
                          setErrorVideoId("");
                        }}
                        placeholder="e.g. dQw4w9WgXcQ"
                        className={errorVideoId ? "border-destructive" : ""}
                      />
                      <Button onClick={validateAndAddVideo} disabled={isValidating}>
                        {isValidating ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                            Validating...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add
                          </span>
                        )}
                      </Button>
                    </div>
                    {errorVideoId && (
                      <p className="text-destructive text-sm mt-1">{errorVideoId}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      Enter the YouTube video ID from the video URL (e.g., youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideosTabContent;
