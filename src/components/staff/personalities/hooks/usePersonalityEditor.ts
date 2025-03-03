
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FormValues, Personality } from "../types";
import { ShowTimes, ShowTime } from "../types/ShowTimes";
import { SocialLinks, SocialLink } from "../types/SocialLinks";
import { useForm } from "react-hook-form";
import { Json } from "@/integrations/supabase/types";

const defaultSocialLinks: SocialLinks = [
  { platform: "facebook", url: "" },
  { platform: "twitter", url: "" },
  { platform: "instagram", url: "" },
];

export const usePersonalityEditor = (canEdit: boolean) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showTimes, setShowTimes] = useState<ShowTimes>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(defaultSocialLinks);
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [selectedPersonality, setSelectedPersonality] = useState<Personality | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      id: "",
      name: "",
      role: "",
      bio: "",
      image_url: "",
      twitter: "",
      instagram: "",
      facebook: "",
      days: "",
      start: "",
      end: ""
    }
  });

  useEffect(() => {
    if (canEdit) {
      fetchPersonalities();
    }
  }, [canEdit]);

  const fetchPersonalityById = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("personalities")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        setName(data.name || "");
        setRole(data.role || "");
        setBio(data.bio || "");
        setImageUrl(data.image_url || "");
        setStartDate(data.start_date ? new Date(data.start_date) : null);
        
        // Type conversion for show_times
        if (data.show_times) {
          const showTimesData = data.show_times as unknown as { days: string[], start: string, end: string };
          
          // Update form values for show times
          form.setValue("days", showTimesData.days.join(", "));
          form.setValue("start", showTimesData.start);
          form.setValue("end", showTimesData.end);
        } else {
          setShowTimes([]);
          form.setValue("days", "");
          form.setValue("start", "");
          form.setValue("end", "");
        }
        
        // Type conversion for social_links
        if (data.social_links) {
          const socialLinksData = data.social_links as unknown as { twitter?: string, instagram?: string, facebook?: string };
          
          // Update form values for social links
          form.setValue("twitter", socialLinksData.twitter || "");
          form.setValue("instagram", socialLinksData.instagram || "");
          form.setValue("facebook", socialLinksData.facebook || "");
        } else {
          setSocialLinks(defaultSocialLinks);
          form.setValue("twitter", "");
          form.setValue("instagram", "");
          form.setValue("facebook", "");
        }
        
        // Update form values
        form.setValue("id", data.id);
        form.setValue("name", data.name || "");
        form.setValue("role", data.role || "");
        form.setValue("bio", data.bio || "");
        form.setValue("image_url", data.image_url || "");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("personalities")
        .select("*")
        .order("name");

      if (error) throw error;

      if (data) {
        // Convert the raw data to match our Personality type
        const typedPersonalities: Personality[] = data.map(p => ({
          id: p.id,
          name: p.name,
          role: p.role,
          bio: p.bio,
          image_url: p.image_url,
          show_times: p.show_times as unknown as { days: string[], start: string, end: string } || null,
          social_links: p.social_links as unknown as { twitter?: string, instagram?: string, facebook?: string } || null,
          created_at: p.created_at,
          updated_at: p.updated_at,
          start_date: p.start_date
        }));
        
        setPersonalities(typedPersonalities);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPersonality = (personality: Personality) => {
    setSelectedPersonality(personality);
    fetchPersonalityById(personality.id);
  };

  const handleImageSelected = async (file: File) => {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("personalities")
        .upload(fileName, file);

      if (error) throw error;

      if (data) {
        const { data: urlData } = await supabase.storage
          .from("personalities")
          .getPublicUrl(data.path);

        setImageUrl(urlData.publicUrl);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (values: FormValues) => {
    if (!selectedPersonality) return;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from("personalities")
        .update({
          name: values.name,
          role: values.role,
          bio: values.bio,
          image_url: imageUrl,
          show_times: {
            days: values.days.split(",").map(day => day.trim()),
            start: values.start,
            end: values.end
          },
          social_links: {
            twitter: values.twitter,
            instagram: values.instagram,
            facebook: values.facebook
          },
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedPersonality.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Personality updated successfully",
      });
      
      await fetchPersonalities();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedPersonality(null);
    setName("");
    setRole("");
    setBio("");
    setImageUrl("");
    setStartDate(null);
    setShowTimes([]);
    setSocialLinks(defaultSocialLinks);
    form.reset({
      id: "",
      name: "",
      role: "",
      bio: "",
      image_url: "",
      twitter: "",
      instagram: "",
      facebook: "",
      days: "",
      start: "",
      end: ""
    });
  };

  const handleSaveNew = async (values: FormValues) => {
    try {
      setIsSaving(true);

      const { data, error } = await supabase
        .from("personalities")
        .insert({
          name: values.name,
          role: values.role,
          bio: values.bio,
          image_url: imageUrl,
          show_times: {
            days: values.days.split(",").map(day => day.trim()),
            start: values.start,
            end: values.end
          },
          social_links: {
            twitter: values.twitter,
            instagram: values.instagram,
            facebook: values.facebook
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "New personality created successfully",
      });
      
      if (data && data.length > 0) {
        // Convert the raw data to match our Personality type
        const newPersonality: Personality = {
          id: data[0].id,
          name: data[0].name,
          role: data[0].role,
          bio: data[0].bio,
          image_url: data[0].image_url,
          show_times: data[0].show_times as unknown as { days: string[], start: string, end: string } || null,
          social_links: data[0].social_links as unknown as { twitter?: string, instagram?: string, facebook?: string } || null,
          created_at: data[0].created_at,
          updated_at: data[0].updated_at,
          start_date: data[0].start_date
        };
        
        setSelectedPersonality(newPersonality);
      }
      
      await fetchPersonalities();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!selectedPersonality || !window.confirm("Are you sure you want to delete this personality?")) {
      return;
    }

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from("personalities")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Personality deleted successfully",
      });
      
      setSelectedPersonality(null);
      await fetchPersonalities();
    } catch (error: any) {
      toast({
        title: "Error",
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
    form,
    personalities,
    loading,
    selectedPersonality,
    isSaving,
    handleSelectPersonality,
    handleImageSelected,
    handleSubmit,
    handleCreateNew,
    handleSaveNew,
    handleDelete
  };
};
