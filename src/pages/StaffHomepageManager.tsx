import React, { useState, useEffect } from "react";
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
  ImageIcon, // Renamed to avoid conflict with ImageIcon component
  Radio,
  BarChart3, // Icon for Stats
  Megaphone // Icon for CTA
} from "lucide-react";
import TitleUpdater from "@/components/TitleUpdater";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingSpinner from "@/components/staff/LoadingSpinner"; // For loading state

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
  const { userRole, isLoading: authLoading } = useStaffAuth();
  const { toast } = useToast();
  
  const [content, setContent] = useState<HomepageContent>(defaultHomepageContent);
  const [isLoading, setIsLoading] = useState(true);
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
    }
  }, [authLoading, canManageHomepage, navigate, toast]);

  const loadHomepageContent = async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('homepage_content')
        .upsert({
          ...content,
          id: 1, // Ensure we are updating the single row
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' }); // Specify conflict resolution

      if (error) throw error;

      toast({
        title: "Success",
        description: "Homepage content updated successfully.",
      });
    } catch (error) {
      console.error('Error saving homepage content:', error);
      toast({
        title: "Error Saving Data",
        description: `Failed to save homepage content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateContentField = (field: keyof HomepageContent, value: string | boolean) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  if (authLoading || (isLoading && canManageHomepage)) {
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
                  Homepage Content
                </h1>
                <p className="text-sm text-muted-foreground">
                  Customize the main sections of your website's homepage.
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
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2">
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="show">Current Show</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="cta">CTA</TabsTrigger>
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
          </Tabs>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default StaffHomepageManager;
