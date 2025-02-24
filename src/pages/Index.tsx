
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import MusicPlayer from "@/components/MusicPlayer";

const Index = () => {
  return (
    <div className="min-h-screen bg-white pb-16">
      <Navbar />
      <Hero />
      <Footer />
      <MusicPlayer />
    </div>
  );
};

export default Index;
