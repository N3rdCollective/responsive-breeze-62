
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

interface AboutPageContent {
  title: string;
  subtitle: string;
  mission: string;
  soundscape: string;
  backstory: string;
  global_stats: string;
  genre_stats: string;
  possibilities_stats: string;
}

const defaultContent: AboutPageContent = {
  title: "About Rappin' Lounge",
  subtitle: "Founded by the visionary DJ Epidemik, Rappin' Lounge Radio offers a unique listening experience, blending the heart of hip-hop with a vibrant mix of genres that reflect the diversity of our global community.",
  mission: "We play a diverse array of music, from classic hip-hop to emerging sounds from around the world, ensuring there's something for every music lover. Rappin' Lounge Radio is a welcoming space for music lovers of all backgrounds. We believe in the power of music to connect us, inspire us, and celebrate our shared humanity.",
  soundscape: "Rappin' Lounge Radio is your passport to the global soundscape. We showcase the best of hip-hop alongside a curated selection of music from around the world, bringing you closer to diverse cultures and artists.",
  backstory: "From an early age, DJ Epidemik was immersed in a world of music, thanks to his dad's diverse record collection. Hip-hop, reggae, house, R&B – the sounds filled his childhood home, sparking a lifelong passion for exploring different genres and cultures. This early exposure laid the groundwork for Rappin' Lounge Radio, a station that reflects Epidemik's eclectic tastes and celebrates the unifying power of music. Here, hip-hop's beats blend seamlessly with a global symphony of sounds, creating a vibrant and inclusive listening experience for all.",
  global_stats: "24/7",
  genre_stats: "100+",
  possibilities_stats: "∞"
};

const About = () => {
  const [content, setContent] = useState<AboutPageContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const { data, error } = await supabase
          .from("about_page")
          .select("*")
          .single();

        if (error && error.code !== "PGRST116") { // PGRST116 is "not found"
          console.error("Error fetching about page content:", error);
        }

        if (data) {
          setContent({
            title: data.title || defaultContent.title,
            subtitle: data.subtitle || defaultContent.subtitle,
            mission: data.mission || defaultContent.mission,
            soundscape: data.soundscape || defaultContent.soundscape,
            backstory: data.backstory || defaultContent.backstory,
            global_stats: data.global_stats || defaultContent.global_stats,
            genre_stats: data.genre_stats || defaultContent.genre_stats,
            possibilities_stats: data.possibilities_stats || defaultContent.possibilities_stats,
          });
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutContent();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fadeIn">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
            {content.title}
          </h1>
          <p className="text-xl text-muted-foreground">
            {content.subtitle}
          </p>
          <Separator className="my-8 bg-primary/20" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          <Card className="p-6 bg-card hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-0">
              <h2 className="text-2xl font-semibold text-primary mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                {content.mission}
              </p>
            </CardContent>
          </Card>
          
          <Card className="p-6 bg-card hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-0">
              <h2 className="text-2xl font-semibold text-primary mb-4">Global Soundscape</h2>
              <p className="text-muted-foreground leading-relaxed">
                {content.soundscape}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-12 p-8 bg-primary/5 border-none animate-fadeIn" style={{ animationDelay: "0.4s" }}>
          <CardContent className="p-0">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Our Back Story
            </h2>
            <div className="text-muted-foreground leading-relaxed">
              {content.backstory.split('\n').map((paragraph, index) => (
                <p key={index} className={index > 0 ? "mt-4" : ""}>
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 animate-fadeIn" style={{ animationDelay: "0.6s" }}>
          <div className="text-center p-6">
            <h3 className="text-3xl font-bold text-primary mb-2">{content.global_stats}</h3>
            <p className="text-muted-foreground">Global Broadcasting</p>
          </div>
          <div className="text-center p-6">
            <h3 className="text-3xl font-bold text-primary mb-2">{content.genre_stats}</h3>
            <p className="text-muted-foreground">Genres Featured</p>
          </div>
          <div className="text-center p-6">
            <h3 className="text-3xl font-bold text-primary mb-2">{content.possibilities_stats}</h3>
            <p className="text-muted-foreground">Musical Possibilities</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
