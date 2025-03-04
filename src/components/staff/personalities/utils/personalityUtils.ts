
import { Json } from "@/integrations/supabase/types";
import { FormValues, Personality } from "../types";

export const preparePersonalityFormData = (personality: Personality): FormValues => {
  return {
    id: personality.id,
    name: personality.name,
    role: personality.role,
    // Clean up bio if it's "• -"
    bio: personality.bio === "• -" ? "" : (personality.bio || ""),
    image_url: personality.image_url || "",
    twitter: personality.social_links?.twitter || "",
    instagram: personality.social_links?.instagram || "",
    facebook: personality.social_links?.facebook || "",
  };
};

export const prepareUpdateData = (values: FormValues, imageUrl: string): {
  name: string;
  role: string;
  bio: string | null;
  image_url: string;
  social_links: Json;
  updated_at: string;
} => {
  // Explicitly cast the objects to Json to ensure compatibility with Supabase
  const socialLinks: Json = {
    twitter: values.twitter || "",
    instagram: values.instagram || "",
    facebook: values.facebook || ""
  };
  
  // Don't save "• -" as bio, convert empty or "• -" to null
  const bioValue = (values.bio && values.bio.trim() !== "" && values.bio !== "• -") 
    ? values.bio.trim() 
    : null;
  
  return {
    name: values.name,
    role: values.role,
    bio: bioValue,
    image_url: imageUrl,
    social_links: socialLinks,
    updated_at: new Date().toISOString()
  };
};
