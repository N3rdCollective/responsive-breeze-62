
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Greeting from "@/components/Greeting";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Greeting />
      <Footer />
    </div>
  );
};

export default Index;
