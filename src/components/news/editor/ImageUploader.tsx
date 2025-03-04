
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
    // Generate a unique filename to prevent collisions
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `news/${fileName}`;
    
    console.log("Generated file path:", filePath);
    
    // Get the current user session to confirm we're authenticated
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Session error:", sessionError);
      throw new Error("Failed to verify authentication session");
    }
    
    if (!sessionData.session) {
      console.error("No active session found - user not authenticated");
      throw new Error("Authentication required. Please log in again.");
    }
    
    console.log("Authenticated as:", sessionData.session.user.email);
    
    // Verify the media bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error("Error fetching buckets:", bucketsError);
      throw new Error("Failed to access storage configuration");
    }
    
    const mediaBucketExists = buckets?.some(bucket => bucket.name === "media");
    
    if (!mediaBucketExists) {
      console.error("Media bucket does not exist");
      throw new Error("Storage configuration issue: Media bucket not found");
    }
    
    console.log("Media bucket found, proceeding with upload");
    
    // Upload the file to Supabase storage
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
    
    // Get the public URL for the uploaded file
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
