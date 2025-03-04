
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface AddVideoFormProps {
  newVideoId: string;
  setNewVideoId: (id: string) => void;
  errorVideoId: string;
  setErrorVideoId: (error: string) => void;
  isValidating: boolean;
  onAddVideo: () => void;
}

const AddVideoForm: React.FC<AddVideoFormProps> = ({
  newVideoId,
  setNewVideoId,
  errorVideoId,
  setErrorVideoId,
  isValidating,
  onAddVideo
}) => {
  return (
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
            <Button onClick={onAddVideo} disabled={isValidating}>
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
  );
};

export default AddVideoForm;
