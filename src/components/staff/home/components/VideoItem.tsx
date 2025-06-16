
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
  isReordering?: boolean;
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
  isReordering = false,
  onMoveVideo,
  onRefreshTitle,
  onRemoveVideo,
  onUpdateField
}) => {
  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4 border rounded-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <img 
            src={`https://img.youtube.com/vi/${video.youtube_id}/default.jpg`} 
            alt={video.title} 
            className="w-16 h-12 object-cover rounded flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          <span className="font-medium truncate">{video.title}</span>
        </div>
        <div className="flex flex-wrap gap-1 sm:flex-nowrap">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMoveVideo(index, 'up')}
            disabled={isFirst || isReordering}
            className="h-8 w-8"
            title={isReordering ? "Reordering..." : "Move up"}
          >
            <Move className="h-4 w-4 rotate-90" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMoveVideo(index, 'down')}
            disabled={isLast || isReordering}
            className="h-8 w-8"
            title={isReordering ? "Reordering..." : "Move down"}
          >
            <Move className="h-4 w-4 -rotate-90" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRefreshTitle(index)}
            title="Refresh title from YouTube"
            className="h-8 w-8"
            disabled={isReordering}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemoveVideo(index)}
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            disabled={isReordering}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`video-id-${index}`}>YouTube Video ID</Label>
          <Input
            id={`video-id-${index}`}
            value={video.youtube_id}
            className="mt-1"
            onChange={(e) => onUpdateField(index, 'youtube_id', e.target.value)}
            disabled={isReordering}
          />
        </div>
        <div>
          <Label htmlFor={`video-title-${index}`} className="flex flex-col sm:flex-row sm:items-center gap-1">
            <span>Title</span>
            <span className="text-xs text-muted-foreground font-normal">(Auto-fetched from YouTube)</span>
          </Label>
          <Input
            id={`video-title-${index}`}
            value={video.title}
            className="mt-1"
            onChange={(e) => onUpdateField(index, 'title', e.target.value)}
            disabled={isReordering}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoItem;
