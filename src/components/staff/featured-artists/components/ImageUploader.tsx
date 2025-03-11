
import React from "react";
import { Button } from "@/components/ui/button";
import { FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ImageIcon, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  currentImageUrl: string;
  onImageSelected: (file: File) => void;
  onImageUrlChange: (url: string) => void;
  isUploading?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImageUrl,
  onImageSelected,
  onImageUrlChange,
  isUploading = false
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageSelected(files[0]);
    }
  };

  const handleManualImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onImageUrlChange(e.target.value);
  };

  return (
    <div className="space-y-4">
      <FormItem>
        <FormLabel>Image</FormLabel>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col">
            <Input
              type="text"
              placeholder="Image URL"
              value={currentImageUrl}
              onChange={handleManualImageUrlChange}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter an image URL directly or upload an image
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Upload Image
                </>
              )}
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
        </div>
      </FormItem>

      {currentImageUrl && (
        <div className="mt-4">
          <div className="border rounded-md overflow-hidden bg-muted">
            <img
              src={currentImageUrl}
              alt="Preview"
              className="object-cover w-full h-48"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
