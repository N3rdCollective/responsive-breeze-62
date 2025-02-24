
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";

interface ScheduleItem {
  date: string;
  start_time: string;
  end_time: string;
  name: string;
  description: string;
}

const fetchSchedule = async () => {
  const response = await fetch("https://public.radio.co/stations/s1a36378a0/embed/schedule");
  if (!response.ok) {
    throw new Error("Failed to fetch schedule");
  }
  return response.json();
};

const Schedule = () => {
  const { data: schedule, isLoading, error } = useQuery({
    queryKey: ["schedule"],
    queryFn: fetchSchedule,
  });

  const formatTime = (timeString: string) => {
    return format(parseISO(timeString), "h:mm a");
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "EEEE, MMMM d");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-black dark:text-[#FFD700] mb-8">Radio Schedule</h1>
          
          {isLoading && (
            <div className="text-center text-white dark:text-white">Loading schedule...</div>
          )}

          {error && (
            <div className="text-center text-red-500">
              Error loading schedule. Please try again later.
            </div>
          )}

          {schedule && (
            <div className="space-y-6">
              {schedule.map((item: ScheduleItem, index: number) => (
                <Card key={index} className="bg-[#F5F5F5] dark:bg-[#333333] border-[#666666]/20 dark:border-white/10">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span className="text-black dark:text-[#FFD700]">{item.name}</span>
                      <span className="text-sm text-white dark:text-white">
                        {formatTime(item.start_time)} - {formatTime(item.end_time)}
                      </span>
                    </CardTitle>
                    <p className="text-sm text-white dark:text-white">{formatDate(item.date)}</p>
                  </CardHeader>
                  {item.description && (
                    <CardContent>
                      <p className="text-white dark:text-white">{item.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Schedule;
