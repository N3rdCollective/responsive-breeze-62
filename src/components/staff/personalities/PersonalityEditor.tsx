
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Loader2, ImageIcon } from "lucide-react";
import { Json } from "@/integrations/supabase/types";
import ImageUploader, { handleImageUpload } from "@/components/news/editor/ImageUploader";

interface ShowTimes {
  days: string[];
  start: string;
  end: string;
}

interface SocialLinks {
  twitter?: string;
  instagram?: string;
  facebook?: string;
}

interface Personality {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  show_times: ShowTimes | null;
  social_links: SocialLinks | null;
  created_at: string | null;
  updated_at: string | null;
}

interface FormValues {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
  twitter: string;
  instagram: string;
  facebook: string;
  days: string;
  start: string;
  end: string;
}

export const PersonalityEditor = () => {
  const { toast } = useToast();
  const { userRole } = useStaffAuth();
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  
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
      end: "",
    }
  });

  // Check if user has permissions
  const canEdit = userRole === "admin" || userRole === "super_admin" || userRole === "moderator";

  const fetchPersonalities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("personalities")
        .select("*")
        .order("name");
      
      if (error) throw error;
      
      if (data) {
        // Convert database data to the expected Personality type
        const typedPersonalities: Personality[] = data.map(item => {
          return {
            ...item,
            show_times: item.show_times as unknown as ShowTimes,
            social_links: item.social_links as unknown as SocialLinks
          };
        });
        
        setPersonalities(typedPersonalities);
      }
    } catch (error) {
      console.error("Error fetching personalities:", error);
      toast({
        title: "Error",
        description: "Failed to load personalities. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonalities();
  }, []);

  const handleSelectPersonality = (id: string) => {
    const personality = personalities.find(p => p.id === id);
    if (!personality) return;
    
    setSelectedPersonality(id);
    setSelectedImage(null);
    
    form.reset({
      id: personality.id,
      name: personality.name,
      role: personality.role,
      bio: personality.bio || "",
      image_url: personality.image_url || "",
      twitter: personality.social_links?.twitter || "",
      instagram: personality.social_links?.instagram || "",
      facebook: personality.social_links?.facebook || "",
      days: personality.show_times?.days.join(", ") || "",
      start: personality.show_times?.start || "",
      end: personality.show_times?.end || "",
    });
  };

  const handleImageSelected = (file: File) => {
    setSelectedImage(file);
  };

  const onSubmit = async (values: FormValues) => {
    if (!canEdit) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit personalities.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      
      console.log("Starting personality update process for ID:", values.id);
      console.log("Form values:", values);
      
      // Process image upload if there's a new image
      let imageUrl = values.image_url;
      if (selectedImage) {
        console.log("Uploading new image...");
        const uploadedImageUrl = await handleImageUpload(selectedImage);
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl;
          console.log("New image uploaded:", imageUrl);
        } else {
          throw new Error("Failed to upload image");
        }
      }
      
      // Format the data for Supabase
      const dayArray = values.days ? values.days.split(",").map(day => day.trim()).filter(day => day !== "") : [];
      console.log("Processed day array:", dayArray);
      
      const updateData = {
        name: values.name,
        role: values.role,
        bio: values.bio || null,
        image_url: imageUrl,
        social_links: {
          twitter: values.twitter || "",
          instagram: values.instagram || "",
          facebook: values.facebook || ""
        },
        show_times: {
          days: dayArray,
          start: values.start || "",
          end: values.end || ""
        },
        updated_at: new Date().toISOString()
      };
      
      console.log("Updating personality with ID:", values.id);
      console.log("Update data:", updateData);
      
      const { data, error } = await supabase
        .from("personalities")
        .update(updateData)
        .eq("id", values.id)
        .select();
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Update response data:", data);
      
      toast({
        title: "Success",
        description: `${values.name} has been updated successfully.`
      });
      
      // Refresh the personalities list
      await fetchPersonalities();
      
      // Re-select the updated personality to reflect changes in the UI
      if (values.id) {
        setTimeout(() => {
          handleSelectPersonality(values.id);
        }, 100);
      }
      
    } catch (error) {
      console.error("Error updating personality:", error);
      toast({
        title: "Error",
        description: "Failed to update personality. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNew = () => {
    // Reset form for new personality
    form.reset({
      id: "",
      name: "",
      role: "Host",
      bio: "",
      image_url: "",
      twitter: "",
      instagram: "",
      facebook: "",
      days: "",
      start: "",
      end: "",
    });
    setSelectedPersonality(null);
    setSelectedImage(null);
  };

  const handleSaveNew = async (values: FormValues) => {
    if (!canEdit) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to create personalities.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      
      // Process image upload if there's a new image
      let imageUrl = values.image_url;
      if (selectedImage) {
        const uploadedImageUrl = await handleImageUpload(selectedImage);
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl;
        } else {
          throw new Error("Failed to upload image");
        }
      }
      
      // Format the data for Supabase
      const dayArray = values.days ? values.days.split(",").map(day => day.trim()).filter(day => day !== "") : [];
      
      const newPersonality = {
        name: values.name,
        role: values.role,
        bio: values.bio,
        image_url: imageUrl,
        social_links: {
          twitter: values.twitter,
          instagram: values.instagram,
          facebook: values.facebook
        } as Json,
        show_times: {
          days: dayArray,
          start: values.start,
          end: values.end
        } as Json
      };
      
      console.log("Creating new personality:", newPersonality);
      
      const { data, error } = await supabase
        .from("personalities")
        .insert(newPersonality)
        .select();
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      toast({
        title: "Success",
        description: `${values.name} has been created successfully.`
      });
      
      // Refresh the personalities list
      await fetchPersonalities();
      
      // Select the newly created personality
      if (data && data.length > 0) {
        handleSelectPersonality(data[0].id);
      }
      
    } catch (error) {
      console.error("Error creating personality:", error);
      toast({
        title: "Error",
        description: "Failed to create personality. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete personalities.",
        variant: "destructive"
      });
      return;
    }

    if (!window.confirm("Are you sure you want to delete this personality? This action cannot be undone.")) {
      return;
    }

    try {
      setIsSaving(true);
      
      console.log("Deleting personality with ID:", id);
      
      const { error } = await supabase
        .from("personalities")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Personality has been deleted successfully."
      });
      
      // Refresh the personalities list
      await fetchPersonalities();
      handleCreateNew();
      
    } catch (error) {
      console.error("Error deleting personality:", error);
      toast({
        title: "Error",
        description: "Failed to delete personality. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!canEdit) {
    return (
      <div className="p-6 text-center">
        <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
        <p className="text-gray-500 dark:text-gray-400">
          You don't have permission to edit personalities.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Personalities</h2>
        <Button 
          onClick={handleCreateNew} 
          variant="outline"
          className="bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
        >
          Create New Personality
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-[#F5F5F5] dark:bg-[#333333] border-[#666666]/20 dark:border-white/10 p-6 rounded-md">
          <h3 className="text-lg font-semibold mb-4">Personalities</h3>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-[#FFD700]" />
            </div>
          ) : (
            <div className="space-y-2">
              {personalities.map(personality => (
                <div 
                  key={personality.id}
                  className={`p-3 rounded-md cursor-pointer ${selectedPersonality === personality.id ? 
                    'bg-[#FFD700]/20 border border-[#FFD700]' : 
                    'hover:bg-white/50 dark:hover:bg-[#444444]'}`}
                  onClick={() => handleSelectPersonality(personality.id)}
                >
                  <p className="font-medium">{personality.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{personality.role}</p>
                </div>
              ))}
              {personalities.length === 0 && (
                <p className="text-center py-4 text-gray-500 dark:text-gray-400">No personalities found</p>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>{selectedPersonality ? "Edit Personality" : "Create New Personality"}</CardTitle>
              <CardDescription>
                {selectedPersonality ? "Update information for this personality" : "Fill in details to create a new personality"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(selectedPersonality ? onSubmit : handleSaveNew)} className="space-y-6">
                  <input type="hidden" {...form.register("id")} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. DJ, Host, Producer" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biography</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Enter biography here..." 
                            className="min-h-[120px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Image</FormLabel>
                        <FormControl>
                          <div>
                            <input 
                              type="hidden" 
                              {...field} 
                            />
                            <ImageUploader
                              currentImageUrl={field.value}
                              onImageSelected={handleImageSelected}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://twitter.com/username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://instagram.com/username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://facebook.com/username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <h3 className="text-lg font-semibold pt-4">Show Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Show Days</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Monday, Wednesday, Friday" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="start"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="9:00 AM" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="end"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="11:00 AM" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <CardFooter className="flex justify-between px-0">
                    <div>
                      {selectedPersonality && (
                        <Button 
                          type="button" 
                          variant="destructive" 
                          onClick={() => handleDelete(selectedPersonality)}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Delete Personality"
                          )}
                        </Button>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isSaving}
                      className="bg-[#FFD700] text-black hover:bg-[#FFD700]/80"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        selectedPersonality ? "Update Personality" : "Create Personality"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PersonalityEditor;
