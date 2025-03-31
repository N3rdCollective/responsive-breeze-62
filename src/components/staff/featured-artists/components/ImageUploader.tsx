
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ImageIcon, Loader2, X } from "lucide-react";

interface ImageUploaderProps {
  currentImageUrl: string;
  onImageSelected: (file: File) => void;
  onImageUrlChange: (url: string) => void;
  isUploading?: boolean;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImageUrl,
  onImageSelected,
  onImageUrlChange,
  isUploading = false,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageSelected(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {currentImageUrl && (
        <div className="relative mx-auto">
          <img 
            src={currentImageUrl} 
            alt="Artist preview" 
            className="h-40 w-40 object-cover rounded-lg border border-border"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 h-6 w-6 rounded-full"
              onClick={() => onImageUrlChange("")}
              disabled={isUploading}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
      
      {!disabled && (
        <div className="flex justify-center">
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={triggerFileInput}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
              {currentImageUrl ? "Change Image" : "Upload Image"}
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <FormControl>
          <Input
            placeholder="https://example.com/image.jpg"
            value={currentImageUrl}
            onChange={(e) => onImageUrlChange(e.target.value)}
            disabled={isUploading || disabled}
          />
        </FormControl>
        <FormMessage />
      </div>
    </div>
  );
};

export default ImageUploader;
