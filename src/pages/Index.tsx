
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero"; // Will be replaced by dynamic hero
import Footer from "@/components/Footer";
import LiveShowBanner from "@/components/LiveShowBanner";
import HomeNewsSection from "@/components/home/HomeNewsSection";
import PersonalitySlider from "@/components/home/PersonalitySlider";
import VideoGallery from "@/components/VideoGallery";
import FeaturedArtistSection from "@/components/home/FeaturedArtistSection";
import { supabase } from "@/integrations/supabase/client";
import { HomeSettings, defaultSettings, VideoData } from "@/components/staff/home/context/HomeSettingsContext"; // Keep for other settings
import { Link } from "react-router-dom"; // For CTA button
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Calendar, Mic, Users, Radio as RadioIcon } from "lucide-react"; // Added icons
import TitleUpdater from "@/components/TitleUpdater"; // For site title

// Interface for homepage_content table data
interface HomepageContentData {
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
}

// Default values for homepage content if fetch fails or no data
const defaultHomepageContentData: HomepageContentData = {
  hero_title: "Your Voice, Your Station",
  hero_subtitle: "Experience the best in community radio with live shows, music, discussions, and more.",
  hero_cta_text: "Listen Live",
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


const Index = () => {
  const [settings, setSettings] = useState<HomeSettings>(defaultSettings);
  const [homepageContent, setHomepageContent] = useState<HomepageContentData>(defaultHomepageContentData);
  const [featuredVideos, setFeaturedVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFeaturedArtist, setShowFeaturedArtist] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch home settings (existing logic)
        const { data: settingsData, error: settingsError } = await supabase
          .from("home_settings")
          .select("*")
          .maybeSingle();
          
        if (settingsError) console.error("Error fetching home settings:", settingsError);
        else if (settingsData) setSettings(settingsData as HomeSettings);

        // Fetch homepage content from the new table
        const { data: contentData, error: contentError } = await supabase
          .from("homepage_content")
          .select("*")
          .eq('id', 1)
          .maybeSingle();

        if (contentError) {
          console.error("Error fetching homepage content:", contentError);
          setHomepageContent(defaultHomepageContentData); // Use defaults on error
        } else if (contentData) {
          setHomepageContent(contentData);
        } else {
          setHomepageContent(defaultHomepageContentData); // Use defaults if no data found
        }
        
        // Fetch featured videos (existing logic)
        const { data: videosData, error: videosError } = await supabase
          .from("featured_videos")
          .select("*")
          .order("display_order", { ascending: true })
          .eq("is_active", true);
          
        if (videosError) console.error("Error fetching featured videos:", videosError);
        else setFeaturedVideos(videosData || []);

        // Check if featured artists exist (existing logic)
        const { data: artistsData, error: artistsError } = await supabase
          .from("featured_artists")
          .select("id")
          .limit(1);

        if (artistsError) {
          console.error("Error checking featured artists:", artistsError);
          setShowFeaturedArtist(false);
        } else {
          setShowFeaturedArtist(artistsData && artistsData.length > 0);
        }
      } catch (error) {
        console.error("Error in data fetch:", error);
        // Ensure defaults are set if any fetch fails
        setSettings(defaultSettings);
        setHomepageContent(defaultHomepageContentData);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const heroStyle = homepageContent.hero_background_image 
    ? { backgroundImage: `url(${homepageContent.hero_background_image})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
    : {};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TitleUpdater /> {/* Uses system_settings for site title, or you can pass a specific title */}
      <Navbar />
      
      {/* Dynamic Hero Section */}
      {settings.show_hero && (
         <section 
          className="relative pt-20 pb-16 text-white" // Adjusted for background image
          style={heroStyle}
        >
          <div 
            className="absolute inset-0 bg-black/50" // Overlay for better text readability if image is present
            style={{ display: homepageContent.hero_background_image ? 'block' : 'none' }}
          ></div>
          <div className="container mx-auto px-4 relative z-10"> {/* Ensure content is above overlay */}
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4 bg-opacity-80 backdrop-blur-sm">
                <RadioIcon className="w-4 h-4 mr-2" />
                Live Broadcasting
              </Badge>
              <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${!homepageContent.hero_background_image ? 'bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent' : ''}`}>
                {homepageContent.hero_title}
              </h1>
              <p className="text-xl text-gray-200 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                {homepageContent.hero_subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Play className="w-5 h-5" />
                  {homepageContent.hero_cta_text}
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/10">
                  <Link to="/schedule" className="gap-2">
                    <Calendar className="w-5 h-5" />
                    View Schedule
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* VideoGallery remains, uses its own data source */}
      <VideoGallery videos={featuredVideos} />
      
      <div className="container mx-auto px-4 py-8">
        {settings.show_live_banner && <LiveShowBanner />} {/* This uses useCurrentShow hook */}
      </div>

      {/* Dynamic Current Show Section */}
      {homepageContent.current_show_enabled && (
        <section className="py-12 border-b dark:border-gray-800">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Mic className="w-5 h-5 text-primary" />
                      Now Playing
                    </CardTitle>
                  </div>
                  <Badge variant="destructive">Live</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-foreground">
                      {homepageContent.current_show_title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {homepageContent.current_show_description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      <span>{homepageContent.current_show_time}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Hosted by {homepageContent.current_show_host}</span>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <Button size="lg" className="w-full md:w-auto gap-2">
                      <Play className="w-5 h-5" />
                      Tune In Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Dynamic Stats Section */}
      <section className="py-12 bg-muted/20 dark:bg-gray-800/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { label: "Live Broadcasting", value: homepageContent.stats_broadcasts },
              { label: "Weekly Shows", value: homepageContent.stats_shows },
              { label: "Monthly Listeners", value: homepageContent.stats_listeners },
              { label: "Community Members", value: homepageContent.stats_members },
            ].map(stat => (
              <div className="text-center p-4 bg-card rounded-lg shadow-sm" key={stat.label}>
                <div className="text-3xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-16">
          {showFeaturedArtist && <FeaturedArtistSection />}
          {settings.show_news_section && <HomeNewsSection />}
          {settings.show_personalities && <PersonalitySlider />}
        </div>
      </div>

      {/* Dynamic Join Community CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 via-background to-secondary/5 dark:from-primary/10 dark:to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              {homepageContent.cta_section_title}
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {homepageContent.cta_section_subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/auth" className="gap-2">
                  <Users className="w-5 h-5" />
                  {homepageContent.cta_button_text}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/about">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
