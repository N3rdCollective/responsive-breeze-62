
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parse } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";
import { useEffect } from "react";

interface Show {
  id: string;
  title: string;
  personality_id: string | null;
  description: string | null;
  start_time: string;
  end_time: string;
  days: string[];
  external_id: string;
  artwork_url: string | null;
}

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

const Schedule = () => {
  const { toast } = useToast();
  const currentDay = DAYS_OF_WEEK[new Date().getDay()];

  // Function to sync schedule from radio.co to our database
  const syncSchedule = async () => {
    try {
      const response = await supabase.functions.invoke('sync-schedule');
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: "Schedule synced",
        description: "The radio schedule has been updated successfully.",
      });
      
      // Refetch the schedule data
      await refetch();
    } catch (error) {
      console.error("Error syncing schedule:", error);
      toast({
        title: "Sync failed",
        description: "Failed to sync the radio schedule. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch shows from our Supabase database
  const fetchShows = async () => {
    const { data, error } = await supabase
      .from("shows")
      .select("*")
      .order("start_time");

    if (error) {
      throw new Error(`Failed to fetch shows: ${error.message}`);
    }

    return data as Show[];
  };

  const { data: shows, isLoading, error, refetch } = useQuery({
    queryKey: ["shows"],
    queryFn: fetchShows,
  });

  // Sync schedule on initial load if no shows exist
  useEffect(() => {
    if (shows && shows.length === 0) {
      syncSchedule();
    }
  }, [shows]);

  const formatTime = (timeString: string) => {
    // Parse time string (HH:mm:ss)
    const date = parse(timeString, "HH:mm:ss", new Date());
    return format(date, "h:mm a");
  };

  const getShowsForDay = (day: string) => {
    if (!shows) return [];
    
    return shows.filter(show => show.days.includes(day));
  };

  // Function to get high quality artwork 
  const getHighQualityArtwork = (url: string | null) => {
    if (!url) return null;
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?quality=100&width=800&height=800`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-black dark:text-[#FFD700]">Radio Schedule</h1>
            <Button 
              variant="outline" 
              size="sm"
              onClick={syncSchedule}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Sync Schedule
            </Button>
          </div>
          
          {isLoading && (
            <div className="text-center text-black dark:text-white">Loading schedule...</div>
          )}

          {error && (
            <div className="text-center text-red-500">
              Error loading schedule. Please try again later.
            </div>
          )}

          {shows && (
            <Tabs defaultValue={currentDay} className="w-full">
              <TabsList className="w-full flex flex-wrap justify-between mb-6">
                {DAYS_OF_WEEK.map((day) => (
                  <TabsTrigger 
                    key={day} 
                    value={day}
                    className="flex-1 min-w-[100px] text-black dark:text-white"
                  >
                    {day}
                  </TabsTrigger>
                ))}
              </TabsList>

              {DAYS_OF_WEEK.map((day) => {
                const dayShows = getShowsForDay(day);
                
                return (
                  <TabsContent key={day} value={day} className="space-y-6">
                    {dayShows.length === 0 ? (
                      <div className="text-center py-8 text-black dark:text-white">
                        No shows scheduled for {day}
                      </div>
                    ) : (
                      dayShows.map((show) => (
                        <Card key={show.id} className="bg-[#F5F5F5] dark:bg-[#333333] border-[#666666]/20 dark:border-white/10">
                          <div className="flex items-start p-6 gap-6">
                            {show.artwork_url && (
                              <div className="flex-shrink-0">
                                <img 
                                  src={getHighQualityArtwork(show.artwork_url)} 
                                  alt={show.title}
                                  className="w-32 h-32 rounded-md object-cover shadow-lg"
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = show.artwork_url || '';
                                  }}
                                />
                              </div>
                            )}
                            <div className="flex-grow">
                              <CardHeader className="p-0">
                                <CardTitle className="flex justify-between items-center">
                                  <span className="text-black dark:text-[#FFD700]">{show.title}</span>
                                  <span className="text-black dark:text-white">
                                    {formatTime(show.start_time)} - {formatTime(show.end_time)}
                                  </span>
                                </CardTitle>
                                {show.description && (
                                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                                    {show.description}
                                  </p>
                                )}
                              </CardHeader>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Schedule;
