import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import { AboutPageContent } from "@/types/about";

const aboutFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().min(1, "Subtitle is required"),
  mission: z.string().min(1, "Mission content is required"),
  soundscape: z.string().min(1, "Soundscape content is required"),
  backstory: z.string().min(1, "Backstory content is required"),
  global_stats: z.string().min(1, "Global stats are required"),
  genre_stats: z.string().min(1, "Genre stats are required"),
  possibilities_stats: z.string().min(1, "Possibilities stats are required"),
});

type AboutFormValues = z.infer<typeof aboutFormSchema>;

const StaffAboutEditor = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isLoading, userRole } = useStaffAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [initialData, setInitialData] = useState<AboutFormValues | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  
  // Check if user has permissions to edit
  const canEdit = userRole === "admin" || userRole === "super_admin" || userRole === "moderator";

  const form = useForm<AboutFormValues>({
    resolver: zodResolver(aboutFormSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      mission: "",
      soundscape: "",
      backstory: "",
      global_stats: "24/7",
      genre_stats: "100+",
      possibilities_stats: "∞",
    },
  });

  // Fetch current about page content
  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const { data, error } = await supabase
          .from("about_page")
          .select("*")
          .single();

        if (error) {
          console.error("Error fetching about page content:", error);
          toast({
            title: "Error",
            description: "Failed to load about page content",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          const formData: AboutFormValues = {
            title: data.title || "About Rappin' Lounge",
            subtitle: data.subtitle || "Founded by the visionary DJ Epidemik...",
            mission: data.mission || "We play a diverse array of music...",
            soundscape: data.soundscape || "Rappin' Lounge Radio is your passport...",
            backstory: data.backstory || "From an early age, DJ Epidemik was immersed...",
            global_stats: data.global_stats || "24/7",
            genre_stats: data.genre_stats || "100+",
            possibilities_stats: data.possibilities_stats || "∞",
          };
          
          setRecordId(data.id);
          setInitialData(formData);
          form.reset(formData);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    fetchAboutContent();
  }, [form, toast]);

  const onSubmit = async (values: AboutFormValues) => {
    if (!canEdit) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to update the about page",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      let updateResult;
      
      if (recordId) {
        // Update existing record
        updateResult = await supabase
          .from("about_page")
          .update(values)
          .eq("id", recordId);
      } else {
        // Insert new record
        updateResult = await supabase
          .from("about_page")
          .insert([values as AboutPageContent]);
      }

      if (updateResult.error) {
        throw updateResult.error;
      }

      toast({
        title: "Success",
        description: "About page content updated successfully",
      });
      
      // Navigate back to staff panel
      navigate("/staff/panel");
    } catch (error) {
      console.error("Error saving about page:", error);
      toast({
        title: "Error",
        description: "Failed to save about page content",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
          <Card className="p-8">
            <h1 className="text-2xl font-bold text-red-500">Permission Denied</h1>
            <p className="mt-4">You don't have permission to edit the about page.</p>
            <Button 
              className="mt-6" 
              onClick={() => navigate("/staff/panel")}
            >
              Back to Staff Panel
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit About Page</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate("/staff/panel")}
          >
            Cancel
          </Button>
        </div>

        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Title</FormLabel>
                    <FormControl>
                      <Input placeholder="About Rappin' Lounge" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter the subtitle that appears below the page title" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="mission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Our Mission</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the radio station's mission" 
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="soundscape"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Global Soundscape</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the global soundscape" 
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="backstory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Our Back Story</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Share the backstory of the radio station" 
                        className="min-h-[200px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <h3 className="text-lg font-semibold pt-4">Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="global_stats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Global Broadcasting</FormLabel>
                      <FormControl>
                        <Input placeholder="24/7" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="genre_stats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genres Featured</FormLabel>
                      <FormControl>
                        <Input placeholder="100+" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="possibilities_stats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Musical Possibilities</FormLabel>
                      <FormControl>
                        <Input placeholder="∞" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate("/staff/panel")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default StaffAboutEditor;
