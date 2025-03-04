
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploaderProps {
  currentImageUrl: string;
  onImageSelected: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ currentImageUrl, onImageSelected }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "No image selected",
        description: "Please select an image file first",
        variant: "destructive",
      });
      return;
    }

    onImageSelected(selectedFile);
    toast({
      title: "Image selected",
      description: "Image will be uploaded when you save",
    });
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="featured-image" className="text-base font-medium">Image</Label>
      
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 items-start">
          <div className="flex-1">
            <Input
              id="featured-image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="flex-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Select an image to use
            </p>
          </div>
          
          <Button 
            type="button" 
            onClick={handleUpload}
            disabled={!selectedFile}
            className="mt-0"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>
      
      {currentImageUrl && !currentImageUrl.startsWith('blob:') && (
        <div className="mt-4 border rounded-md p-4 bg-muted/20">
          <div className="flex items-center gap-2 mb-2">
            <Image className="h-4 w-4" />
            <p className="text-sm font-medium">Current image:</p>
          </div>
          <img
            src={currentImageUrl}
            alt="Selected"
            className="w-full max-w-md rounded-md"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

export const handleImageUpload = async (file: File): Promise<string | null> => {
  if (!file) return null;
  
  try {
    console.log("Starting image upload process for:", file.name);
    // Sanitize filename to remove non-ASCII characters
    const sanitizedFileName = file.name.replace(/[^\x00-\x7F]/g, '');
    const fileExt = sanitizedFileName.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `news/${fileName}`;
    
    console.log("Generated file path:", filePath);
    
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from("media")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false
      });
      
    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw uploadError;
    }
    
    console.log("Upload successful:", uploadData);
    
    const { data } = supabase.storage
      .from("media")
      .getPublicUrl(filePath);
      
    console.log("Public URL generated:", data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};
