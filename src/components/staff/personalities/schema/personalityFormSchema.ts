
import { z } from "zod";

// Define the form schema
export const personalityFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  role: z.string().min(2, { message: "Role must be at least 2 characters" }),
  bio: z.string().optional(),
  image_url: z.string().optional().or(z.literal("")),
  image_file: z.instanceof(File).optional(),
  social_links: z.object({
    twitter: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
    instagram: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
    facebook: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal(""))
  }).optional()
});

export type PersonalityFormValues = z.infer<typeof personalityFormSchema>;

// Helper function to safely parse social links from database
export const parseSocialLinks = (dbSocialLinks: any) => {
  // If null or not an object, return empty defaults
  if (!dbSocialLinks || typeof dbSocialLinks !== 'object') {
    return {
      twitter: "",
      instagram: "",
      facebook: ""
    };
  }
  
  // Return object with correct properties, defaulting to empty strings
  return {
    twitter: dbSocialLinks.twitter || "",
    instagram: dbSocialLinks.instagram || "",
    facebook: dbSocialLinks.facebook || ""
  };
};
