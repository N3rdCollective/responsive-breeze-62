
import { Json } from "@/integrations/supabase/types";
import { FormValues, Personality } from "../types";

export const preparePersonalityFormData = (personality: Personality): FormValues => {
  // Ensure we properly handle null values
  const days = personality.show_times?.days ? 
    personality.show_times.days.join(", ") : "";
              
  return {
    id: personality.id,
    name: personality.name,
    role: personality.role,
    bio: personality.bio || "",
    image_url: personality.image_url || "",
    twitter: personality.social_links?.twitter || "",
    instagram: personality.social_links?.instagram || "",
    facebook: personality.social_links?.facebook || "",
    days: days,
    start: personality.show_times?.start || "",
    end: personality.show_times?.end || "",
  };
};

export const prepareUpdateData = (values: FormValues, imageUrl: string): {
  name: string;
  role: string;
  bio: string | null;
  image_url: string;
  social_links: Json;
  show_times: Json;
  updated_at: string;
} => {
  // Format the data for Supabase
  const dayArray = values.days 
    ? values.days.split(",").map(day => day.trim()).filter(day => day !== "") 
    : [];
  
  // Explicitly cast the objects to Json to ensure compatibility with Supabase
  const socialLinks: Json = {
    twitter: values.twitter || "",
    instagram: values.instagram || "",
    facebook: values.facebook || ""
  };
  
  const showTimes: Json = {
    days: dayArray,
    start: values.start || "",
    end: values.end || ""
  };
  
  return {
    name: values.name,
    role: values.role,
    bio: values.bio || null,
    image_url: imageUrl,
    social_links: socialLinks,
    show_times: showTimes,
    updated_at: new Date().toISOString()
  };
};
