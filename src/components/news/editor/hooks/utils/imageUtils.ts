
/**
 * Handles image uploading for news posts
 */
export const handlePostImage = async (
  featuredImage: File | null,
  currentFeaturedImageUrl: string,
  uploadImage: (file: File) => Promise<string | null>,
  setIsUploading: (isUploading: boolean) => void
): Promise<string> => {
  let featuredImageUrl = currentFeaturedImageUrl;
  
  // Upload the featured image if a new one was selected
  if (featuredImage) {
    console.log("Uploading new featured image");
    setIsUploading(true);
    
    try {
      const uploadedUrl = await uploadImage(featuredImage);
      if (uploadedUrl) {
        featuredImageUrl = uploadedUrl;
        console.log("Image uploaded successfully, updating featured_image to:", featuredImageUrl);
      } else {
        console.error("Image upload failed, but continuing with save");
      }
    } catch (imageError) {
      console.error("Error uploading image:", imageError);
      throw new Error(`Image upload failed: ${(imageError as Error)?.message || "Unknown error"}`);
    } finally {
      setIsUploading(false);
    }
  }
  
  return featuredImageUrl;
};
