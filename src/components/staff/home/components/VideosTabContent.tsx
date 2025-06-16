
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { useVideoManagement } from "../hooks/useVideoManagement";
import { useVideoTitleRefresh } from "../hooks/useVideoTitleRefresh";
import { useHomeSettings } from "../context/HomeSettingsContext";
import VideoItem from "./VideoItem";
import AddVideoForm from "./AddVideoForm";
import LoadingSpinner from "@/components/staff/LoadingSpinner";

const VideosTabContent: React.FC = () => {
  const { isLoading } = useHomeSettings();
  const {
    featuredVideos,
    newVideoId,
    setNewVideoId,
    isValidating: isAddingVideo,
    isReordering,
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

  const isProcessing = isAddingVideo || isRefreshing || isReordering;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
        <span className="ml-2 text-muted-foreground">Loading featured videos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <div className="flex flex-col space-y-3 sm:space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h3 className="text-lg font-semibold">Manage Featured Music Videos</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshAllVideoTitles}
              disabled={isProcessing || featuredVideos.length === 0}
              className="gap-1 w-full sm:w-auto"
            >
              {isRefreshing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="sm:hidden">Update All Video Titles</span>
              <span className="hidden sm:inline">Update All Titles</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Add, remove, or edit YouTube videos shown in the Hero section and Featured Music Videos gallery
          </p>
        </div>

        <Card>
          <CardContent className="pt-4 p-4 sm:p-6 sm:pt-4">
            <div className="space-y-4">
              {featuredVideos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No featured videos found. Add your first video below.</p>
                </div>
              ) : (
                featuredVideos.map((video, index) => (
                  <VideoItem
                    key={`${video.id}-${index}`}
                    video={video}
                    index={index}
                    isFirst={index === 0}
                    isLast={index === featuredVideos.length - 1}
                    isReordering={isReordering}
                    onMoveVideo={moveVideo}
                    onRefreshTitle={refreshVideoTitle}
                    onRemoveVideo={handleRemoveVideo}
                    onUpdateField={handleUpdateVideoField}
                  />
                ))
              )}

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
