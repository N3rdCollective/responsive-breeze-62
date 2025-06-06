
import React from "react";
import { useCurrentShow } from "@/hooks/useCurrentShow";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Disc3 } from "lucide-react";
import { Link } from "react-router-dom";

const DEFAULT_ARTWORK = "/lovable-uploads/12fe363a-3bad-45f9-8212-66621f85b9ac.png";

const LiveShowBanner = () => {
  const { currentShow, isLoading } = useCurrentShow();

  if (isLoading) {
    return (
      <Card className="bg-[#F5F5F5] dark:bg-[#333333] border-[#666666]/20 dark:border-white/10 shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-20 animate-pulse">
            <p className="text-muted-foreground">Loading show information...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentShow) {
    return null; // Don't show anything if there's no current show
  }

  return (
    <Card className="bg-[#F5F5F5] dark:bg-[#333333] border-[#666666]/20 dark:border-white/10 shadow-md overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {currentShow.artwork ? (
            <div className="w-full md:w-1/5 h-32 md:h-auto">
              <img 
                src={currentShow.artwork} 
                alt={currentShow.showName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Use our Rappin' Lounge logo as fallback
                  e.currentTarget.src = DEFAULT_ARTWORK;
                }}
              />
            </div>
          ) : (
            <div className="w-full md:w-1/5 h-32 md:h-auto bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <img src={DEFAULT_ARTWORK} alt="Rappin' Lounge" className="p-4 max-h-full" />
            </div>
          )}
          
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Badge className="bg-red-500 text-white mr-2 animate-pulse">LIVE NOW</Badge>
                <span className="text-sm text-muted-foreground">{currentShow.timeSlot}</span>
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold text-black dark:text-[#FFD700] mb-1">
                {currentShow.showName}
              </h3>
              
              {currentShow.hostName && (
                <p className="text-base md:text-lg text-gray-600 dark:text-gray-300">
                  Hosted by: {currentShow.hostName}
                </p>
              )}
            </div>
            
            <div className="mt-2">
              <Link to="/schedule" className="text-sm text-blue-500 dark:text-blue-400 hover:underline">
                View full schedule →
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveShowBanner;
