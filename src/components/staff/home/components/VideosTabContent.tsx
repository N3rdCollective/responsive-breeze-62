
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { useVideoManagement } from "../hooks/useVideoManagement";
import { useVideoTitleRefresh } from "../hooks/useVideoTitleRefresh";
import VideoItem from "./VideoItem";
import AddVideoForm from "./AddVideoForm";

const VideosTabContent: React.FC = () => {
  const {
    featuredVideos,
    newVideoId,
    setNewVideoId,
    isValidating: isAddingVideo,
    errorVideoId,
    setErrorVideoId,
    handleUpdateVideoField,
    handleRemoveVideo,
    validateAndAddVideo,
    moveVideo
  } = useVideoManagement();

  const {
    isValidating: isRefreshing,
    refreshVideoTitle,
    refreshAllVideoTitles
  } = useVideoTitleRefresh();

  const isProcessing = isAddingVideo || isRefreshing;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-col space-y-1.5">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Manage Featured Music Videos</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshAllVideoTitles}
              disabled={isProcessing || featuredVideos.length === 0}
              className="gap-1"
            >
              {isRefreshing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Update All Titles
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Add, remove, or edit YouTube videos shown in the Hero section and Featured Music Videos gallery
          </p>
        </div>

        <Card>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {featuredVideos.map((video, index) => (
                <VideoItem
                  key={`${video.id}-${index}`}
                  video={video}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === featuredVideos.length - 1}
                  onMoveVideo={moveVideo}
                  onRefreshTitle={refreshVideoTitle}
                  onRemoveVideo={handleRemoveVideo}
                  onUpdateField={handleUpdateVideoField}
                />
              ))}

              <AddVideoForm
                newVideoId={newVideoId}
                setNewVideoId={setNewVideoId}
                errorVideoId={errorVideoId}
                setErrorVideoId={setErrorVideoId}
                isValidating={isAddingVideo}
                onAddVideo={validateAndAddVideo}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideosTabContent;

