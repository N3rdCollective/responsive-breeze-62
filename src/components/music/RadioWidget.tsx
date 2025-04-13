
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import MusicRequestModal from "./MusicRequestModal";

interface RadioWidgetProps {
  embedId?: string;
}

const RadioWidget = ({ embedId = "w34954fe" }: RadioWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);
  
  useEffect(() => {
    // Create and load the script
    const script = document.createElement("script");
    script.src = `https://embed.radio.co/request/${embedId}.js`;
    script.async = true;
    
    script.onload = () => {
      console.log("Radio.co widget script loaded");
      setIsWidgetLoaded(true);
    };
    
    script.onerror = (error) => {
      console.error("Error loading Radio.co widget:", error);
    };
    
    // Append the script to the container
    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }
    
    // Cleanup function
    return () => {
      if (containerRef.current && script.parentNode === containerRef.current) {
        containerRef.current.removeChild(script);
      }
    };
  }, [embedId]);
  
  return (
    <div className="relative">
      {/* The widget container */}
      <div 
        ref={containerRef} 
        className="radio-widget w-full overflow-hidden rounded-lg shadow-md bg-card text-card-foreground"
      >
        {!isWidgetLoaded && (
          <div className="flex items-center justify-center h-[300px] bg-muted/30 animate-pulse">
            <p className="text-muted-foreground">Loading radio widget...</p>
          </div>
        )}
      </div>
      
      {/* Request song button */}
      <Button
        onClick={() => setIsModalOpen(true)}
        className="mt-4 w-full bg-[#FFD700] text-black hover:bg-[#FFD700]/90 dark:bg-[#FFD700] dark:text-black dark:hover:bg-[#FFD700]/90"
      >
        <Music className="mr-2 h-4 w-4" />
        Request a Song
      </Button>
      
      {/* Music request modal */}
      <MusicRequestModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
      
      {/* Custom styles for the widget to match site theme */}
      <style jsx global>{`
        /* Light mode styles */
        :root {
          --radio-bg: hsl(var(--background));
          --radio-text: hsl(var(--foreground));
          --radio-primary: hsl(var(--primary));
          --radio-muted: hsl(var(--muted));
          --radio-accent: #FFD700;
        }
        
        /* Dark mode styles */
        .dark {
          --radio-bg: hsl(var(--background));
          --radio-text: hsl(var(--foreground));
          --radio-primary: hsl(var(--primary));
          --radio-muted: hsl(var(--muted));
          --radio-accent: #FFD700;
        }
        
        /* Widget customization */
        .radio-co-request {
          background-color: var(--radio-bg) !important;
          color: var(--radio-text) !important;
          font-family: inherit !important;
          border-radius: 0.75rem !important;
          overflow: hidden !important;
        }
        
        .radio-co-request input[type="text"],
        .radio-co-request input[type="email"],
        .radio-co-request textarea {
          background-color: var(--radio-bg) !important;
          color: var(--radio-text) !important;
          border: 1px solid hsl(var(--border)) !important;
          border-radius: 0.5rem !important;
        }
        
        .radio-co-request button {
          background-color: var(--radio-accent) !important;
          color: #000 !important;
          border-radius: 0.5rem !important;
          font-weight: 500 !important;
        }
        
        .radio-co-request button:hover {
          opacity: 0.9 !important;
        }
      `}</style>
    </div>
  );
};

export default RadioWidget;
