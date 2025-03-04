
import React from "react";
import { VideoData } from "../context/HomeSettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Move, RefreshCw } from "lucide-react";

interface VideoItemProps {
  video: VideoData;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveVideo: (index: number, direction: 'up' | 'down') => void;
  onRefreshTitle: (index: number) => void;
  onRemoveVideo: (index: number) => void;
  onUpdateField: (index: number, field: keyof VideoData, value: string | number | boolean) => void;
}

const VideoItem: React.FC<VideoItemProps> = ({
  video,
  index,
  isFirst,
  isLast,
  onMoveVideo,
  onRefreshTitle,
  onRemoveVideo,
  onUpdateField
}) => {
  return (
    <div className="flex flex-col gap-2 p-3 border rounded-md">
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
            onClick={() => onMoveVideo(index, 'up')}
            disabled={isFirst}
            className="h-8 w-8"
          >
            <Move className="h-4 w-4 rotate-90" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMoveVideo(index, 'down')}
            disabled={isLast}
            className="h-8 w-8"
          >
            <Move className="h-4 w-4 -rotate-90" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRefreshTitle(index)}
            title="Refresh title from YouTube"
            className="h-8 w-8"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemoveVideo(index)}
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
          onChange={(e) => onUpdateField(index, 'youtube_id', e.target.value)}
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
          onChange={(e) => onUpdateField(index, 'title', e.target.value)}
        />
      </div>
    </div>
  );
};

export default VideoItem;
