
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Personalities from "@/components/Personalities";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Personalities />
      <Footer />
    </div>
  );
};

export default Index;
