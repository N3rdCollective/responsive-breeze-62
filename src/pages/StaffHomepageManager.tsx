import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Save, 
  ArrowLeft, 
  Home, 
  Eye,
  ImageIcon,
  Radio,
  BarChart3, // Icon for Stats
  Megaphone, // Icon for CTA
  LayoutGrid // Icon for Section Visibility
} from "lucide-react";
import TitleUpdater from "@/components/TitleUpdater";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import { HomeSettings, defaultSettings as defaultHomeSettingsBase } from "@/components/staff/home/context/HomeSettingsContext";
import useStaffActivityLogger from "@/hooks/useStaffActivityLogger";

// Define defaultHomeSettings without the id property initially for new records
const defaultHomeSettings: Omit<HomeSettings, 'id' | 'created_at' | 'updated_at'> = {
  show_hero: true,
  show_news_section: true,
  show_personalities: true,
  show_live_banner: true,
  show_stats_section: true,
};

interface HomepageContent {
  id?: number; // id is not directly editable but used for upsert
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_background_image?: string;
  current_show_enabled: boolean;
  current_show_title: string;
  current_show_description: string;
  current_show_host: string;
  current_show_time: string;
  stats_listeners: string;
  stats_shows: string;
  stats_members: string;
  stats_broadcasts: string;
  cta_section_title: string;
  cta_section_subtitle: string;
  cta_button_text: string;
  updated_at?: string;
}

const defaultHomepageContent: HomepageContent = {
  hero_title: "Your Voice, Your Station",
  hero_subtitle: "Experience the best in community radio with live shows, music, discussions, and more.",
  hero_cta_text: "Listen Live",
  hero_background_image: "",
  current_show_enabled: true,
  current_show_title: "Morning Drive Time",
  current_show_description: "Start your day with the latest music, news, and community updates.",
  current_show_host: "Sarah & Mike",
  current_show_time: "6:00 AM - 10:00 AM",
  stats_listeners: "1.2M",
  stats_shows: "50+",
  stats_members: "10K+",
  stats_broadcasts: "24/7",
  cta_section_title: "Join Our Community",
  cta_section_subtitle: "Become part of our growing community. Share your thoughts, discover new music, and connect with fellow radio enthusiasts.",
  cta_button_text: "Sign Up Today"
};

const StaffHomepageManager = () => {
  const navigate = useNavigate();
  const { userRole, isLoading: authLoading, user } = useStaffAuth();
  const { toast } = useToast();
  const { logActivity } = useStaffActivityLogger();
  
  const [content, setContent] = useState<HomepageContent>(defaultHomepageContent);
  const [homeSettings, setHomeSettings] = useState<HomeSettings>({...defaultHomeSettingsBase, id: ''}); // Initialize with base defaults + empty id
  const [homeSettingsId, setHomeSettingsId] = useState<string | null>(null);
  
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Permissions check
  const canManageHomepage = userRole === 'admin' || userRole === 'super_admin' || userRole === 'content_manager';

  useEffect(() => {
    if (!authLoading && !canManageHomepage) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to manage homepage content.",
        variant: "destructive",
      });
      navigate('/staff/panel');
      return;
    }
    if (!authLoading && canManageHomepage) {
      loadHomepageContent();
      loadHomeSettings();
    }
  }, [authLoading, canManageHomepage, navigate, toast, loadHomepageContent, loadHomeSettings]);

  const loadHomepageContent = useCallback(async () => {
    try {
      setIsLoadingContent(true);
      const { data, error } = await supabase
        .from('homepage_content')
        .select('*')
        .eq('id', 1) // We know there's only one row with id 1
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setContent(data);
      } else {
        // If no data (e.g., first run after migration), use defaults
        setContent(defaultHomepageContent);
      }
    } catch (error) {
      console.error('Error loading homepage content:', error);
      toast({
        title: "Error Loading Data",
        description: "Could not load homepage content. Using default values.",
        variant: "destructive"
      });
      setContent(defaultHomepageContent); // Fallback to defaults on error
    } finally {
      setIsLoadingContent(false);
    }
  }, [toast]);

  const loadHomeSettings = useCallback(async () => {
    try {
      setIsLoadingSettings(true);
      const { data, error } = await supabase
        .from('home_settings')
        .select('*')
        .limit(1) // Assuming a single row for global home settings
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setHomeSettings(data as HomeSettings);
        setHomeSettingsId(data.id);
      } else {
        // Use default settings but don't set an ID yet
        setHomeSettings({...defaultHomeSettingsBase, id: '', created_at: undefined, updated_at: undefined });
        setHomeSettingsId(null);
      }
    } catch (error) {
      console.error('Error loading home settings:', error);
      toast({
        title: "Error Loading Settings",
        description: "Could not load home settings. Using default values.",
        variant: "destructive"
      });
      setHomeSettings({...defaultHomeSettingsBase, id: '', created_at: undefined, updated_at: undefined });
      setHomeSettingsId(null);
    } finally {
      setIsLoadingSettings(false);
    }
  }, [toast]);

  const handleSave = async () => {
    setIsSaving(true);
    let contentSaved = false;
    let settingsSaved = false;

    try {
      // Save homepage_content
      const contentToSave = {
        ...content,
        id: 1, // Ensure we are updating the single row
        updated_at: new Date().toISOString()
      };
      const { error: contentError } = await supabase
        .from('homepage_content')
        .upsert(contentToSave, { onConflict: 'id' }); // Specify conflict resolution

      if (contentError) throw contentError;
      contentSaved = true;
      if (user) {
        await logActivity('update_homepage_content', 'Updated homepage textual content.', 'homepage_content', 1, contentToSave);
      }
      
      // Save home_settings
      const settingsToSave = {
        ...homeSettings,
        updated_at: new Date().toISOString(),
      };

      if (homeSettingsId) { // Update existing settings
        const { error: settingsError } = await supabase
          .from('home_settings')
          .update(settingsToSave)
          .eq('id', homeSettingsId);
        if (settingsError) throw settingsError;
      } else { // Insert new settings
        // Remove id if it's an empty string from default state
        const { id, ...settingsForInsert } = settingsToSave;
        const { data: newSettings, error: settingsError } = await supabase
          .from('home_settings')
          .insert(settingsForInsert)
          .select()
          .single();
        if (settingsError) throw settingsError;
        if (newSettings) {
          setHomeSettings(newSettings as HomeSettings); // Update state with new ID and timestamps
          setHomeSettingsId(newSettings.id);
        }
      }
      settingsSaved = true;
      if (user) {
         await logActivity('update_homepage_settings', 'Updated homepage section visibility.', 'settings', homeSettingsId || 'new_setting', settingsToSave);
      }

      toast({
        title: "Success",
        description: "Homepage content and settings updated successfully.",
      });

    } catch (error) {
      console.error('Error saving homepage data:', error);
      let errorMessage = `Failed to save data: ${error instanceof Error ? error.message : 'Unknown error'}`;
      if (contentSaved && !settingsSaved) {
        errorMessage = `Homepage content saved, but failed to save section visibility settings: ${error instanceof Error ? error.message : 'Unknown error'}`;
      } else if (!contentSaved) {
         errorMessage = `Failed to save homepage content: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
      toast({
        title: "Error Saving Data",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateContentField = (field: keyof HomepageContent, value: string | boolean) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const updateHomeSettingField = (field: keyof Pick<HomeSettings, 'show_hero' | 'show_news_section' | 'show_personalities' | 'show_live_banner' | 'show_stats_section'>, value: boolean) => {
    setHomeSettings(prev => ({ ...prev, [field]: value }));
  };

  if (authLoading || ((isLoadingContent || isLoadingSettings) && canManageHomepage)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-150px)]"> {/* Adjust height for navbar/footer */}
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  if (!canManageHomepage && !authLoading) {
    // This case should ideally be caught by the useEffect redirect, but as a fallback:
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Access Denied. Redirecting...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <TitleUpdater title="Homepage Content Manager" />
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        {/* Increased pt-8 to pt-24 to avoid overlap with fixed Navbar */}
        <main className="flex-grow max-w-6xl mx-auto px-4 pt-24 pb-16 w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/staff/panel')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Panel
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Home className="h-6 w-6" />
                  Homepage Content & Settings
                </h1>
                <p className="text-sm text-muted-foreground">
                  Customize content and section visibility of your website's homepage.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => window.open('/', '_blank')}
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="hero" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              <TabsTrigger value="hero">
                <ImageIcon className="h-4 w-4 mr-2 sm:hidden md:inline-flex" />Hero
              </TabsTrigger>
              <TabsTrigger value="show">
                <Radio className="h-4 w-4 mr-2 sm:hidden md:inline-flex" />Current Show
              </TabsTrigger>
              <TabsTrigger value="stats">
                <BarChart3 className="h-4 w-4 mr-2 sm:hidden md:inline-flex" />Stats
              </TabsTrigger>
              <TabsTrigger value="cta">
                <Megaphone className="h-4 w-4 mr-2 sm:hidden md:inline-flex" />CTA
              </TabsTrigger>
              <TabsTrigger value="visibility">
                <LayoutGrid className="h-4 w-4 mr-2 sm:hidden md:inline-flex" />Visibility
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hero">
              <Card>
                <CardHeader>
                  <CardTitle>Hero Section</CardTitle>
                  <CardDescription>Manage the main introductory content of your homepage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="hero_title">Title</Label>
                    <Input id="hero_title" value={content.hero_title} onChange={(e) => updateContentField('hero_title', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="hero_subtitle">Subtitle</Label>
                    <Textarea id="hero_subtitle" value={content.hero_subtitle} onChange={(e) => updateContentField('hero_subtitle', e.target.value)} rows={3} />
                  </div>
                  <div>
                    <Label htmlFor="hero_cta_text">Button Text</Label>
                    <Input id="hero_cta_text" value={content.hero_cta_text} onChange={(e) => updateContentField('hero_cta_text', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="hero_background_image">Background Image URL (Optional)</Label>
                    <Input id="hero_background_image" value={content.hero_background_image || ''} onChange={(e) => updateContentField('hero_background_image', e.target.value)} placeholder="https://example.com/image.jpg" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="show">
              <Card>
                <CardHeader>
                  <CardTitle>Current Show Section</CardTitle>
                  <CardDescription>Configure the "Now Playing" or "Current Show" block.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="current_show_enabled" checked={content.current_show_enabled} onCheckedChange={(checked) => updateContentField('current_show_enabled', checked)} />
                    <Label htmlFor="current_show_enabled">Enable Current Show Section</Label>
                  </div>
                  <div>
                    <Label htmlFor="current_show_title">Show Title</Label>
                    <Input id="current_show_title" value={content.current_show_title} onChange={(e) => updateContentField('current_show_title', e.target.value)} disabled={!content.current_show_enabled} />
                  </div>
                  <div>
                    <Label htmlFor="current_show_description">Show Description</Label>
                    <Textarea id="current_show_description" value={content.current_show_description} onChange={(e) => updateContentField('current_show_description', e.target.value)} rows={3} disabled={!content.current_show_enabled}/>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="current_show_host">Host(s)</Label>
                        <Input id="current_show_host" value={content.current_show_host} onChange={(e) => updateContentField('current_show_host', e.target.value)} disabled={!content.current_show_enabled}/>
                    </div>
                    <div>
                        <Label htmlFor="current_show_time">Show Time</Label>
                        <Input id="current_show_time" value={content.current_show_time} onChange={(e) => updateContentField('current_show_time', e.target.value)} disabled={!content.current_show_enabled}/>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle>Statistics Section</CardTitle>
                  <CardDescription>Manage the key statistics displayed on the homepage.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stats_listeners">Listeners</Label>
                    <Input id="stats_listeners" value={content.stats_listeners} onChange={(e) => updateContentField('stats_listeners', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="stats_shows">Shows</Label>
                    <Input id="stats_shows" value={content.stats_shows} onChange={(e) => updateContentField('stats_shows', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="stats_members">Members</Label>
                    <Input id="stats_members" value={content.stats_members} onChange={(e) => updateContentField('stats_members', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="stats_broadcasts">Broadcasts</Label>
                    <Input id="stats_broadcasts" value={content.stats_broadcasts} onChange={(e) => updateContentField('stats_broadcasts', e.target.value)} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cta">
              <Card>
                <CardHeader>
                  <CardTitle>Call to Action Section</CardTitle>
                  <CardDescription>Customize the final call to action block on your homepage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cta_section_title">Title</Label>
                    <Input id="cta_section_title" value={content.cta_section_title} onChange={(e) => updateContentField('cta_section_title', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="cta_section_subtitle">Subtitle</Label>
                    <Textarea id="cta_section_subtitle" value={content.cta_section_subtitle} onChange={(e) => updateContentField('cta_section_subtitle', e.target.value)} rows={3} />
                  </div>
                  <div>
                    <Label htmlFor="cta_button_text">Button Text</Label>
                    <Input id="cta_button_text" value={content.cta_button_text} onChange={(e) => updateContentField('cta_button_text', e.target.value)} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="visibility">
              <Card>
                <CardHeader>
                  <CardTitle>Homepage Section Visibility</CardTitle>
                  <CardDescription>Toggle which major sections appear on your homepage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  <div className="flex items-center justify-between space-x-2 p-4 border rounded-md">
                    <div>
                      <Label htmlFor="show_hero" className="font-medium">Hero Section</Label>
                      <p className="text-sm text-muted-foreground">
                        The main banner at the top of the home page.
                      </p>
                    </div>
                    <Switch
                      id="show_hero"
                      checked={homeSettings.show_hero}
                      onCheckedChange={(checked) => updateHomeSettingField('show_hero', checked)}
                    />
                  </div>
                   <div className="flex items-center justify-between space-x-2 p-4 border rounded-md">
                    <div>
                      <Label htmlFor="show_live_banner" className="font-medium">Live Show Banner</Label>
                      <p className="text-sm text-muted-foreground">
                        Banner showing currently playing live show information.
                      </p>
                    </div>
                    <Switch
                      id="show_live_banner"
                      checked={homeSettings.show_live_banner}
                      onCheckedChange={(checked) => updateHomeSettingField('show_live_banner', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2 p-4 border rounded-md">
                    <div>
                      <Label htmlFor="show_stats_section" className="font-medium">Statistics Section</Label>
                      <p className="text-sm text-muted-foreground">
                        Display key statistics (listeners, shows, etc.).
                      </p>
                    </div>
                    <Switch
                      id="show_stats_section"
                      checked={homeSettings.show_stats_section}
                      onCheckedChange={(checked) => updateHomeSettingField('show_stats_section', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2 p-4 border rounded-md">
                    <div>
                      <Label htmlFor="show_news_section" className="font-medium">News Section</Label>
                      <p className="text-sm text-muted-foreground">
                        Display recent news articles.
                      </p>
                    </div>
                    <Switch
                      id="show_news_section"
                      checked={homeSettings.show_news_section}
                      onCheckedChange={(checked) => updateHomeSettingField('show_news_section', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2 p-4 border rounded-md">
                    <div>
                      <Label htmlFor="show_personalities" className="font-medium">Personalities Slider</Label>
                      <p className="text-sm text-muted-foreground">
                        Display a carousel of radio personalities.
                      </p>
                    </div>
                    <Switch
                      id="show_personalities"
                      checked={homeSettings.show_personalities}
                      onCheckedChange={(checked) => updateHomeSettingField('show_personalities', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default StaffHomepageManager;
