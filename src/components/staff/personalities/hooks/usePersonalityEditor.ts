
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PersonalityFormData } from "../types";
import { ShowTimes, ShowTime } from "../types/ShowTimes";
import { SocialLinks, SocialLink } from "../types/SocialLinks";

const defaultSocialLinks = [
  { platform: "facebook", url: "" },
  { platform: "twitter", url: "" },
  { platform: "instagram", url: "" },
  { platform: "youtube", url: "" },
  { platform: "website", url: "" },
];

export const usePersonalityEditor = (personalityId?: string) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showTimes, setShowTimes] = useState<ShowTimes>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(defaultSocialLinks);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (personalityId) {
      loadPersonality(personalityId);
    } else {
      resetForm();
    }
  }, [personalityId]);

  const loadPersonality = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("personalities")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        setName(data.name || "");
        setRole(data.role || "");
        setBio(data.bio || "");
        setImageUrl(data.image_url || "");
        setStartDate(data.start_date ? new Date(data.start_date) : null);
        
        // Properly handle type conversion for show_times
        if (data.show_times) {
          setShowTimes(data.show_times as unknown as ShowTimes);
        } else {
          setShowTimes([]);
        }
        
        // Properly handle type conversion for social_links
        if (data.social_links) {
          setSocialLinks(data.social_links as unknown as SocialLinks);
        } else {
          setSocialLinks(defaultSocialLinks);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error loading personality",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setRole("");
    setBio("");
    setImageUrl("");
    setStartDate(null);
    setShowTimes([]);
    setSocialLinks(defaultSocialLinks);
  };

  const handleSave = async (data: PersonalityFormData) => {
    setIsSaving(true);
    try {
      const personalityData = {
        ...data,
        show_times: data.showTimes,
        social_links: data.socialLinks,
        start_date: data.startDate ? data.startDate.toISOString() : null,
      };

      let result;

      if (personalityId) {
        result = await supabase
          .from("personalities")
          .update(personalityData)
          .eq("id", personalityId);
      } else {
        result = await supabase.from("personalities").insert(personalityData);
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast({
        title: "Success",
        description: `Personality ${
          personalityId ? "updated" : "created"
        } successfully!`,
      });

      navigate("/staff/personalities");
    } catch (error: any) {
      toast({
        title: "Error saving personality",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!personalityId) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("personalities")
        .delete()
        .eq("id", personalityId);

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Success",
        description: "Personality deleted successfully!",
      });

      navigate("/staff/personalities");
    } catch (error: any) {
      toast({
        title: "Error deleting personality",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    name,
    setName,
    role,
    setRole,
    bio,
    setBio,
    imageUrl,
    setImageUrl,
    startDate,
    setStartDate,
    showTimes,
    setShowTimes,
    socialLinks,
    setSocialLinks,
    isSaving,
    isLoading,
    handleSave,
    handleDelete,
  };
};
