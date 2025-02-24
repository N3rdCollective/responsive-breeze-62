
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO, isSameDay } from "date-fns";

interface ScheduleItem {
  start: string;
  end: string;
  playlist: {
    name: string;
    colour: string;
    artist: string;
    title: string;
    artwork: string | null;
  };
}

interface ScheduleResponse {
  data: ScheduleItem[];
}

const fetchSchedule = async () => {
  const response = await fetch("https://public.radio.co/stations/s1a36378a0/embed/schedule");
  if (!response.ok) {
    throw new Error("Failed to fetch schedule");
  }
  const data: ScheduleResponse = await response.json();
  return data.data;
};

// Function to get high quality artwork URL
const getHighQualityArtwork = (url: string | null) => {
  if (!url) return null;
  
  // Remove any existing size parameters if they exist
  const baseUrl = url.split('?')[0];
  
  // Add parameters for high quality
  return `${baseUrl}?quality=100&width=800&height=800`;
};

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
  const { data: schedule, isLoading, error } = useQuery({
    queryKey: ["schedule"],
    queryFn: fetchSchedule,
  });

  const formatTime = (timeString: string) => {
    return format(parseISO(timeString), "h:mm a");
  };

  const formatDate = (timeString: string) => {
    return format(parseISO(timeString), "EEEE, MMMM d");
  };

  // Get current day for default tab
  const currentDay = DAYS_OF_WEEK[new Date().getDay()];

  // Filter schedule items by day
  const getScheduleForDay = (day: string) => {
    if (!schedule) return [];
    const today = new Date();
    
    return schedule.filter(item => {
      const itemDate = parseISO(item.start);
      // For the current day, only show today's shows
      if (day === currentDay) {
        return isSameDay(itemDate, today);
      }
      // For other days, show all shows on that day of the week
      return format(itemDate, 'EEEE') === day;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-black dark:text-[#FFD700] mb-8">Radio Schedule</h1>
          
          {isLoading && (
            <div className="text-center text-black dark:text-white">Loading schedule...</div>
          )}

          {error && (
            <div className="text-center text-red-500">
              Error loading schedule. Please try again later.
            </div>
          )}

          {schedule && (
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

              {DAYS_OF_WEEK.map((day) => (
                <TabsContent key={day} value={day} className="space-y-6">
                  {getScheduleForDay(day).length === 0 ? (
                    <div className="text-center py-8 text-black dark:text-white">
                      No shows scheduled for {day === currentDay ? "today" : day}
                    </div>
                  ) : (
                    getScheduleForDay(day).map((item: ScheduleItem, index: number) => (
                      <Card key={index} className="bg-[#F5F5F5] dark:bg-[#333333] border-[#666666]/20 dark:border-white/10">
                        <div className="flex items-start p-6 gap-6">
                          {item.playlist.artwork && (
                            <div className="flex-shrink-0">
                              <img 
                                src={getHighQualityArtwork(item.playlist.artwork)} 
                                alt={item.playlist.name}
                                className="w-32 h-32 rounded-md object-cover shadow-lg"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = item.playlist.artwork || '';
                                }}
                              />
                            </div>
                          )}
                          <div className="flex-grow">
                            <CardHeader className="p-0">
                              <CardTitle className="flex justify-between items-center">
                                <span className="text-black dark:text-[#FFD700]">{item.playlist.name}</span>
                                <span className="text-black dark:text-white">
                                  {formatTime(item.start)} - {formatTime(item.end)}
                                </span>
                              </CardTitle>
                              <p className="text-black dark:text-white mt-2">
                                {formatDate(item.start)}
                              </p>
                              {item.playlist.artist && (
                                <p className="text-gray-600 dark:text-gray-300 mt-2">
                                  Hosted by: {item.playlist.artist}
                                </p>
                              )}
                            </CardHeader>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Schedule;
