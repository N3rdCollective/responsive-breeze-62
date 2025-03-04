
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import LiveShowBanner from "@/components/LiveShowBanner";
import HomeNewsSection from "@/components/home/HomeNewsSection";
import PersonalitySlider from "@/components/home/PersonalitySlider";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <LiveShowBanner />
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-16">
          <HomeNewsSection />
          <PersonalitySlider />
        </div>
      </div>
      
      <div className="mb-20">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
