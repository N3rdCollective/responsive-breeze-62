
import { handleImageUpload as uploadImage } from "../ImageUploader";

export const useImageHandler = () => {
  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      return await uploadImage(file);
    } catch (error) {
      console.error("Error in handleImageUpload:", error);
      return null;
    }
  };

  return {
    handleImageUpload
  };
};
