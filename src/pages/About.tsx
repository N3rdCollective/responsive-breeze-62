
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
            About Our Radio Station
          </h1>
          <p className="text-xl text-muted-foreground">
            Broadcasting the best music and entertainment since 1995
          </p>
          <Separator className="my-8 bg-primary/20" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          <Card className="p-6 bg-card hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-0">
              <h2 className="text-2xl font-semibold text-primary mb-4">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed">
                Founded in 1995, we've been at the forefront of bringing the best music and 
                entertainment to our listeners. Our commitment to quality programming and 
                community engagement has made us one of the most trusted voices in radio.
                Through decades of dedication, we've built a legacy of excellence in broadcasting.
              </p>
            </CardContent>
          </Card>
          
          <Card className="p-6 bg-card hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-0">
              <h2 className="text-2xl font-semibold text-primary mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                We strive to provide engaging, diverse, and high-quality programming that 
                entertains, informs, and connects our community. Through music, news, and 
                interactive shows, we create meaningful experiences for our listeners, fostering
                cultural exchange and understanding.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-12 p-8 bg-primary/5 border-none animate-fadeIn" style={{ animationDelay: "0.4s" }}>
          <CardContent className="p-0">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Community Impact
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Over the years, we've proudly supported numerous local initiatives and events, 
              becoming an integral part of our community's cultural fabric. Our station has 
              been a platform for local artists, businesses, and community leaders to reach 
              and engage with their audience. Through our programming and community outreach, 
              we've helped foster connections, promote local talent, and contribute to the 
              vibrant culture of our region.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 animate-fadeIn" style={{ animationDelay: "0.6s" }}>
          <div className="text-center p-6">
            <h3 className="text-3xl font-bold text-primary mb-2">28+</h3>
            <p className="text-muted-foreground">Years of Broadcasting</p>
          </div>
          <div className="text-center p-6">
            <h3 className="text-3xl font-bold text-primary mb-2">1M+</h3>
            <p className="text-muted-foreground">Monthly Listeners</p>
          </div>
          <div className="text-center p-6">
            <h3 className="text-3xl font-bold text-primary mb-2">500+</h3>
            <p className="text-muted-foreground">Community Events</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
