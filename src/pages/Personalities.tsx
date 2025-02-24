
import Navbar from "@/components/Navbar";
import { Personalities as PersonalitiesSection } from "@/components/Personalities";
import Footer from "@/components/Footer";

const Personalities = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <PersonalitiesSection />
      </div>
      <div className="mb-20">
        <Footer />
      </div>
    </div>
  );
};

export default Personalities;
