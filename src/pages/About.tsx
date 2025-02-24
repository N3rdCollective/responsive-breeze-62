
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
            About Our Radio Station
          </h1>
          <p className="text-xl text-muted-foreground">
            Broadcasting the best music and entertainment since 1995
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Our Story</h2>
            <p className="text-muted-foreground">
              Founded in 1995, we've been at the forefront of bringing the best music and 
              entertainment to our listeners. Our commitment to quality programming and 
              community engagement has made us one of the most trusted voices in radio.
            </p>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Our Mission</h2>
            <p className="text-muted-foreground">
              We strive to provide engaging, diverse, and high-quality programming that 
              entertains, informs, and connects our community. Through music, news, and 
              interactive shows, we create meaningful experiences for our listeners.
            </p>
          </div>
        </div>

        <div className="mt-16 p-8 bg-card rounded-lg border border-border">
          <h2 className="text-2xl font-semibold text-card-foreground mb-4">
            Community Impact
          </h2>
          <p className="text-muted-foreground">
            Over the years, we've proudly supported numerous local initiatives and events. 
            Our station has been a platform for local artists, businesses, and community 
            leaders to reach and engage with their audience.
          </p>
        </div>
      </div>
      <div className="mb-20">
        <Footer />
      </div>
    </div>
  );
};

export default About;
