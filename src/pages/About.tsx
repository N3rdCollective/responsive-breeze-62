
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fadeIn">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
            About Rappin' Lounge
          </h1>
          <p className="text-xl text-muted-foreground">
            Founded by the visionary DJ Epidemik, Rappin' Lounge Radio offers a unique listening experience, 
            blending the heart of hip-hop with a vibrant mix of genres that reflect the diversity of our 
            global community.
          </p>
          <Separator className="my-8 bg-primary/20" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          <Card className="p-6 bg-card hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-0">
              <h2 className="text-2xl font-semibold text-primary mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                We play a diverse array of music, from classic hip-hop to emerging sounds from around 
                the world, ensuring there's something for every music lover. Rappin' Lounge Radio 
                is a welcoming space for music lovers of all backgrounds. We believe in the power 
                of music to connect us, inspire us, and celebrate our shared humanity.
              </p>
            </CardContent>
          </Card>
          
          <Card className="p-6 bg-card hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-0">
              <h2 className="text-2xl font-semibold text-primary mb-4">Global Soundscape</h2>
              <p className="text-muted-foreground leading-relaxed">
                Rappin' Lounge Radio is your passport to the global soundscape. We showcase the 
                best of hip-hop alongside a curated selection of music from around the world, 
                bringing you closer to diverse cultures and artists.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-12 p-8 bg-primary/5 border-none animate-fadeIn" style={{ animationDelay: "0.4s" }}>
          <CardContent className="p-0">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Our Back Story
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              From an early age, DJ Epidemik was immersed in a world of music, thanks to his 
              dad's diverse record collection. Hip-hop, reggae, house, R&B – the sounds filled 
              his childhood home, sparking a lifelong passion for exploring different genres 
              and cultures.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This early exposure laid the groundwork for Rappin' Lounge Radio, a station that 
              reflects Epidemik's eclectic tastes and celebrates the unifying power of music. 
              Here, hip-hop's beats blend seamlessly with a global symphony of sounds, creating 
              a vibrant and inclusive listening experience for all.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 animate-fadeIn" style={{ animationDelay: "0.6s" }}>
          <div className="text-center p-6">
            <h3 className="text-3xl font-bold text-primary mb-2">24/7</h3>
            <p className="text-muted-foreground">Global Broadcasting</p>
          </div>
          <div className="text-center p-6">
            <h3 className="text-3xl font-bold text-primary mb-2">100+</h3>
            <p className="text-muted-foreground">Genres Featured</p>
          </div>
          <div className="text-center p-6">
            <h3 className="text-3xl font-bold text-primary mb-2">∞</h3>
            <p className="text-muted-foreground">Musical Possibilities</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
