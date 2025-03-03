
import Navbar from "@/components/Navbar";
import { Personalities as PersonalitiesSection } from "@/components/Personalities";
import Footer from "@/components/Footer";

const Personalities = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-16">
        <PersonalitiesSection />
      </div>
      <Footer />
    </div>
  );
};

export default Personalities;
