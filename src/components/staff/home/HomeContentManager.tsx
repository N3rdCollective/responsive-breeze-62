
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";

interface HomeSettings {
  id: string;
  show_hero: boolean;
  show_news_section: boolean;
  show_personalities: boolean;
  show_live_banner: boolean;
  created_at?: string;
  updated_at?: string;
}

const defaultSettings: HomeSettings = {
  id: "home-settings",
  show_hero: true,
  show_news_section: true,
  show_personalities: true,
  show_live_banner: true
};

const HomeContentManager = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<HomeSettings>(defaultSettings);

  // Fetch current home page settings
  const { isLoading } = useQuery({
    queryKey: ["home-settings"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("home_settings")
          .select("*")
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          setSettings(data as HomeSettings);
          return data;
        }
        
        // If no settings exist, create default settings
        const { data: newData, error: insertError } = await supabase
          .from("home_settings")
          .insert(defaultSettings)
          .select()
          .single();
          
        if (insertError) throw insertError;
        
        if (newData) {
          setSettings(newData as HomeSettings);
          return newData;
        }
        
        return defaultSettings;
      } catch (error) {
        console.error("Error fetching home settings:", error);
        toast({
          title: "Error",
          description: "Failed to load home page settings",
          variant: "destructive",
        });
        return defaultSettings;
      }
    },
  });
  
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("home_settings")
        .upsert(settings)
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Home page settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving home settings:", error);
      toast({
        title: "Error",
        description: "Failed to save home page settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (field: keyof HomeSettings) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Home Page Components</CardTitle>
          <CardDescription>
            Toggle visibility of different sections on the home page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sections" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-2">
              <TabsTrigger value="sections">Section Visibility</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sections" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="hero-toggle" className="font-medium">Hero Section</Label>
                    <p className="text-sm text-muted-foreground">
                      Hero section with radio station branding and call-to-action buttons
                    </p>
                  </div>
                  <Switch 
                    id="hero-toggle" 
                    checked={settings.show_hero}
                    onCheckedChange={() => handleToggle('show_hero')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="live-banner-toggle" className="font-medium">Live Show Banner</Label>
                    <p className="text-sm text-muted-foreground">
                      Banner displaying currently playing show
                    </p>
                  </div>
                  <Switch 
                    id="live-banner-toggle" 
                    checked={settings.show_live_banner}
                    onCheckedChange={() => handleToggle('show_live_banner')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="news-toggle" className="font-medium">News Section</Label>
                    <p className="text-sm text-muted-foreground">
                      Latest news articles from the blog
                    </p>
                  </div>
                  <Switch 
                    id="news-toggle" 
                    checked={settings.show_news_section}
                    onCheckedChange={() => handleToggle('show_news_section')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="personalities-toggle" className="font-medium">Personalities Slider</Label>
                    <p className="text-sm text-muted-foreground">
                      Carousel of radio hosts and personalities
                    </p>
                  </div>
                  <Switch 
                    id="personalities-toggle" 
                    checked={settings.show_personalities}
                    onCheckedChange={() => handleToggle('show_personalities')}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="pt-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-lg">Home Page Structure</h3>
                <div className="mt-4 space-y-2">
                  <div className={`p-3 rounded-lg border ${settings.show_hero ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-gray-100 border-gray-200 text-gray-500 dark:bg-gray-800/50 dark:border-gray-700'}`}>
                    Hero Section {!settings.show_hero && '(Hidden)'}
                  </div>
                  
                  <div className={`p-3 rounded-lg border ${settings.show_live_banner ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-gray-100 border-gray-200 text-gray-500 dark:bg-gray-800/50 dark:border-gray-700'}`}>
                    Live Show Banner {!settings.show_live_banner && '(Hidden)'}
                  </div>
                  
                  <div className={`p-3 rounded-lg border ${settings.show_news_section ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' : 'bg-gray-100 border-gray-200 text-gray-500 dark:bg-gray-800/50 dark:border-gray-700'}`}>
                    Latest News Section {!settings.show_news_section && '(Hidden)'}
                  </div>
                  
                  <div className={`p-3 rounded-lg border ${settings.show_personalities ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' : 'bg-gray-100 border-gray-200 text-gray-500 dark:bg-gray-800/50 dark:border-gray-700'}`}>
                    Personalities Slider {!settings.show_personalities && '(Hidden)'}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings} 
          disabled={isSaving}
          className="gap-2"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default HomeContentManager;
