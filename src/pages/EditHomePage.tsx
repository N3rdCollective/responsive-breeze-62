
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const EditHomePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    mainHeading: "Experience the Power of Sound",
    subHeading: "Join us on a journey through music, stories, and connections that move you.",
    backgroundImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Changes Saved",
      description: "Your changes have been saved successfully.",
    });
    navigate("/staff-panel");
  };

  const handleCancel = () => {
    toast({
      title: "Changes Discarded",
      description: "Your changes have been discarded.",
    });
    navigate("/staff-panel");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tighter text-black dark:text-[#FFD700]">
              Edit Home Page
            </h1>
            <Button
              variant="outline"
              className="bg-white dark:bg-[#222222] text-black dark:text-white"
              onClick={handleCancel}
            >
              Back to Dashboard
            </Button>
          </div>

          <Card className="bg-[#F5F5F5] dark:bg-[#333333] border-[#666666]/20 dark:border-white/10 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-black dark:text-white">
                    Main Heading
                  </Label>
                  <Input
                    value={formData.mainHeading}
                    onChange={(e) => setFormData({ ...formData, mainHeading: e.target.value })}
                    className="bg-white dark:bg-[#222222] text-black dark:text-white border-[#666666]/20 dark:border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-black dark:text-white">
                    Sub Heading
                  </Label>
                  <Textarea
                    value={formData.subHeading}
                    onChange={(e) => setFormData({ ...formData, subHeading: e.target.value })}
                    className="bg-white dark:bg-[#222222] text-black dark:text-white border-[#666666]/20 dark:border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-black dark:text-white">
                    Background Image URL
                  </Label>
                  <Input
                    value={formData.backgroundImage}
                    onChange={(e) => setFormData({ ...formData, backgroundImage: e.target.value })}
                    className="bg-white dark:bg-[#222222] text-black dark:text-white border-[#666666]/20 dark:border-white/10"
                  />
                  <div className="mt-2">
                    <img
                      src={formData.backgroundImage}
                      alt="Background Preview"
                      className="rounded-lg w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05";
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90 dark:bg-[#FFD700] dark:text-black dark:hover:bg-[#FFD700]/90"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>

          <Card className="bg-[#F5F5F5] dark:bg-[#333333] border-[#666666]/20 dark:border-white/10 p-6">
            <h2 className="text-xl font-semibold text-black dark:text-[#FFD700] mb-4">
              Preview
            </h2>
            <div className="relative h-96 rounded-lg overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('${formData.backgroundImage}')`,
                  opacity: 0.3,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#F5F5F5]/90 to-white/90 dark:from-[#333333]/90 dark:to-black/90" />
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-6">
                <h1 className="text-4xl font-bold mb-4 text-black dark:text-[#FFD700]">
                  {formData.mainHeading}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
                  {formData.subHeading}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EditHomePage;
