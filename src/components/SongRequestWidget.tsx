import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Music } from 'lucide-react';

// Define a type for the track object - kept for submitToRadioCo
interface Track {
  id: number | string;
  title: string;
  artist: string;
  album?: string;
}

const SongRequestWidget = () => {
  const [requestStatus, setRequestStatus] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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
      setIsDialogOpen(false); // Close dialog on simulated success
      
      return { success: true };
    } catch (error) {
      console.error('Error submitting to Radio.co:', error);
      setRequestStatus('Error submitting request. Please try again.');
      setTimeout(() => setRequestStatus(''), 3000);
      // Keep dialog open on error for user to see message or retry
      return { success: false };
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-8 text-center"> {/* Added text-center for the button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="bg-yellow-500 hover:bg-yellow-600 text-black dark:bg-yellow-400 dark:hover:bg-yellow-500 dark:text-black">
            <Music className="mr-2 h-4 w-4" /> Request a Song
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-gray-900 to-black border-yellow-500/20 p-0">
          {/* Card styling moved to DialogContent, iframe card removed for cleaner dialog */}
          <div className="p-6 space-y-4">
            <DialogHeader className="pb-3 text-left"> {/* Ensure header text is aligned left */}
              <DialogTitle className="flex items-center gap-2 text-yellow-400">
                <Music className="h-5 w-5" />
                Request a Track - {RADIO_CO_CONFIG.stationName}
              </DialogTitle>
            </DialogHeader>
            
            {/* Status Message inside Dialog */}
            {requestStatus && (
              <div className={`p-3 rounded-lg border ${requestStatus.startsWith('Error submitting') ? 'bg-red-900/20 border-red-500/30 text-red-400' : 'bg-green-900/20 border-green-500/30 text-green-400'}`}>
                <p className="text-sm">{requestStatus}</p>
              </div>
            )}
            
            {/* Embedded Radio.co Widget */}
            <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden border border-yellow-500/20">
              <iframe 
                src={RADIO_CO_CONFIG.embedUrl}
                width="100%" 
                height="350" // Adjusted height for dialog
                style={{ border: 'none', background: 'transparent' }}
                title="Radio.co Request Widget"
                loading="lazy"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Display status message outside dialog as well if it's a global status not tied to iframe interaction */}
      {/* Or remove if status is only relevant inside the dialog */}
      {/* For now, keeping it simple and status only inside dialog triggered by submitToRadioCo */}
    </div>
  );
};

export default SongRequestWidget;
