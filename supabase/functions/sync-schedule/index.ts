
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { format, parseISO } from 'https://esm.sh/date-fns@3.6.0'

// Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Define the type structure for the radio.co schedule response
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

interface ProcessedShow {
  title: string;
  personality_id: string | null;
  description: string | null;
  start_time: string;
  end_time: string;
  days: string[];
  external_id: string;
  artwork_url: string | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch schedule from radio.co
    console.log("Fetching schedule from radio.co...");
    const response = await fetch("https://public.radio.co/stations/s1a36378a0/embed/schedule");
    
    if (!response.ok) {
      throw new Error(`Failed to fetch schedule: ${response.status} ${response.statusText}`);
    }
    
    const scheduleData: ScheduleResponse = await response.json();
    console.log(`Fetched ${scheduleData.data.length} schedule items`);

    // Process the schedule data
    const processedShows: Record<string, ProcessedShow> = {};

    // Group shows by name and collect days
    scheduleData.data.forEach(item => {
      const showDate = parseISO(item.start);
      const day = format(showDate, 'EEEE');
      const startTime = format(showDate, 'HH:mm:ss');
      const endTime = format(parseISO(item.end), 'HH:mm:ss');
      
      // Create a unique identifier for the show based on name and time slot
      const showId = `${item.playlist.name}_${startTime}_${endTime}`;
      
      if (!processedShows[showId]) {
        processedShows[showId] = {
          title: item.playlist.name,
          personality_id: null, // We'll need to match this later
          description: null,
          start_time: startTime,
          end_time: endTime,
          days: [day],
          external_id: showId,
          artwork_url: item.playlist.artwork,
        };
      } else if (!processedShows[showId].days.includes(day)) {
        processedShows[showId].days.push(day);
      }
    });

    // Upsert the processed shows into the database
    console.log(`Upserting ${Object.keys(processedShows).length} shows into the database`);
    
    const upsertPromises = Object.values(processedShows).map(async (show) => {
      const { error } = await supabase
        .from('shows')
        .upsert({
          title: show.title,
          personality_id: show.personality_id,
          description: show.description,
          start_time: show.start_time,
          end_time: show.end_time,
          days: show.days,
          external_id: show.external_id,
          artwork_url: show.artwork_url,
        }, { 
          onConflict: 'external_id',
          ignoreDuplicates: false,
        });
      
      if (error) {
        console.error(`Error upserting show ${show.title}:`, error);
      }
    });

    await Promise.all(upsertPromises);
    console.log("Sync completed successfully");

    return new Response(JSON.stringify({ success: true, message: "Schedule synced successfully" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error syncing schedule:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
