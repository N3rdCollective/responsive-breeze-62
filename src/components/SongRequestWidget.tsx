
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Button and Input are no longer used directly in the simplified widget
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// Badge is not used
// import { Badge } from '@/components/ui/badge';
// Search icon is not used
import { Music, Users } from 'lucide-react';

// Define a type for the track object for better type safety - though not directly used in UI now, good for submitToRadioCo
interface Track {
  id: number | string;
  title: string;
  artist: string;
  album?: string;
}

const SongRequestWidget = () => {
  const [requestStatus, setRequestStatus] = useState('');
  
  const RADIO_CO_CONFIG = {
    widgetId: 'w34954fe',
    stationName: 'Rappin Lounge Radio',
    confirmationText: 'Your request has been added to the queue.',
    embedUrl: 'https://embed.radio.co/request/w34954fe.html'
  };

  // Function to potentially submit to Radio.co (kept for potential future use or if iframe triggers it somehow)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const submitToRadioCo = async (track: Track) => {
    try {
      console.log('Attempting to submit to Radio.co:', {
        widgetId: RADIO_CO_CONFIG.widgetId,
        track: track
      });
      
      setRequestStatus(RADIO_CO_CONFIG.confirmationText);
      setTimeout(() => setRequestStatus(''), 3000);
      
      return { success: true };
    } catch (error) {
      console.error('Error submitting to Radio.co:', error);
      setRequestStatus('Error submitting request. Please try again.');
      setTimeout(() => setRequestStatus(''), 3000);
      return { success: false };
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 my-8"> {/* Added my-8 for consistent spacing */}
      {/* Request Form */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-yellow-500/20 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-yellow-400">
            <Music className="h-5 w-5" />
            Request a Track - {RADIO_CO_CONFIG.stationName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Message */}
          {requestStatus && (
            // Using previous dynamic styling for error/success
            <div className={`p-3 rounded-lg border ${requestStatus.startsWith('Error submitting') ? 'bg-red-900/20 border-red-500/30 text-red-400' : 'bg-green-900/20 border-green-500/30 text-green-400'}`}>
              <p className="text-sm">{requestStatus}</p>
            </div>
          )}
          
          {/* Removed Search Input and Button */}
          {/* Removed Search Results Display */}
          {/* Removed isSearching loader */}

          {/* Fallback: Embedded Radio.co Widget (Now primary) */}
          {/* Adjusted styling to match previous version's embedded section */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <p className="text-gray-400 text-sm mb-3">Use the official request form:</p>
            <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden border border-yellow-500/20">
              <iframe 
                src={RADIO_CO_CONFIG.embedUrl}
                width="100%" 
                height="350"
                style={{ border: 'none', background: 'transparent' }}
                title="Radio.co Request Widget"
                loading="lazy"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules/Info Card - Retaining previous styling and content */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-yellow-500/20 shadow-xl">
        <CardContent className="pt-6 pb-4">
          <div className="text-xs text-gray-400 space-y-1.5">
            <p className="font-semibold text-gray-300 mb-1">Request Guidelines:</p>
            <p className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-yellow-500" />
              Request your favorite tracks
            </p>
            <p className="pl-[22px]">Requests are subject to approval</p>
            <p className="pl-[22px]">Popular requests may be played sooner</p>
            <p className="pl-[22px]">Keep it clean and radio-friendly</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SongRequestWidget;
