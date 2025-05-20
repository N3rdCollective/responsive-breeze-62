
import Navbar from "@/components/Navbar";
import { Loader2 } from "lucide-react";

const NewTopicPageLoader = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20 px-4 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );
};

export default NewTopicPageLoader;
