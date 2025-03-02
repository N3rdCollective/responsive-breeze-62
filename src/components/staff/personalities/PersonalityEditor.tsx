
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import LoadingSpinner from "@/components/staff/LoadingSpinner";

// Define the form schema
const personalityFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  role: z.string().min(2, { message: "Role must be at least 2 characters" }),
  bio: z.string().optional(),
  image_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  social_links: z.object({
    twitter: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
    instagram: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
    facebook: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal(""))
  }).optional(),
  start_date: z.string().optional().or(z.literal(""))
});

type PersonalityFormValues = z.infer<typeof personalityFormSchema>;

const PersonalityEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch personality data
  const { data: personality, isLoading, error } = useQuery({
    queryKey: ["personality", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("personalities")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Create form with default values
  const form = useForm<PersonalityFormValues>({
    resolver: zodResolver(personalityFormSchema),
    defaultValues: {
      name: "",
      role: "",
      bio: "",
      image_url: "",
      social_links: {
        twitter: "",
        instagram: "",
        facebook: ""
      },
      start_date: ""
    }
  });

  // Helper function to safely parse social links from database
  const parseSocialLinks = (dbSocialLinks: any) => {
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

  // Update form values when personality data is loaded
  useEffect(() => {
    if (personality) {
      form.reset({
        name: personality.name || "",
        role: personality.role || "",
        bio: personality.bio || "",
        image_url: personality.image_url || "",
        social_links: parseSocialLinks(personality.social_links),
        start_date: personality.start_date || ""
      });
    }
  }, [personality, form]);

  const onSubmit = async (values: PersonalityFormValues) => {
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from("personalities")
        .update({
          name: values.name,
          role: values.role,
          bio: values.bio || null,
          image_url: values.image_url || null,
          social_links: values.social_links || null,
          start_date: values.start_date || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Personality updated",
        description: "The personality has been successfully updated.",
      });
      
      navigate("/staff/personalities");
    } catch (error) {
      console.error("Error updating personality:", error);
      toast({
        title: "Error updating personality",
        description: "There was an error updating the personality. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              Error loading personality. Please try again later.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Personality: {personality?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
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
                      <Input placeholder="DJ / Host / Producer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter personality biography..."
                        className="min-h-[150px]"
                        {...field}
                        value={field.value || ""}
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
                    <FormLabel>Profile Image URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Social Media Links</h3>
                
                <FormField
                  control={form.control}
                  name="social_links.twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://twitter.com/username" 
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="social_links.instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://instagram.com/username" 
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="social_links.facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://facebook.com/username" 
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <CardFooter className="flex justify-end space-x-4 px-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/staff/personalities")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalityEditor;
