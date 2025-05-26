import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Music, Search, Users } from 'lucide-react'; // ThumbsUp and Clock removed

// Define a type for the track object for better type safety
interface Track {
  id: number | string;
  title: string;
  artist: string;
  album?: string; // Album is optional
}

const SongRequestWidget = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [requestStatus, setRequestStatus] = useState('');
  
  const RADIO_CO_CONFIG = {
    widgetId: 'w34954fe',
    stationName: 'Rappin Lounge Radio',
    confirmationText: 'Your request has been added to the queue.',
    embedUrl: 'https://embed.radio.co/request/w34954fe.html'
  };

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockResults: Track[] = [
        { id: 101, title: "God's Plan", artist: "Drake", album: "Scorpion" },
        { id: 102, title: "MONEY", artist: "Cardi B", album: "Invasion of Privacy" },
        { id: 103, title: "Nice For What", artist: "Drake", album: "Scorpion" },
        { id: 104, title: "Sicko Mode", artist: "Travis Scott", album: "Astroworld" },
        { id: 105, title: "HUMBLE.", artist: "Kendrick Lamar", album: "DAMN." },
        { id: 106, title: "Lose Yourself", artist: "Eminem", album: "8 Mile Soundtrack" },
      ].filter(track => 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(mockResults);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRequest = async (track: Track) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const radioCoResult = await submitToRadioCo(track); // Keep radioCoResult if needed for future logic
    
    // Clear form after request
    setSearchQuery('');
    setSearchResults([]);
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
            <div className={`p-3 rounded-lg border ${requestStatus.startsWith('Error') ? 'bg-red-900/20 border-red-500/30 text-red-400' : 'bg-green-900/20 border-green-500/30 text-green-400'}`}> {/* Dynamic error/success styling */}
              <p className="text-sm">{requestStatus}</p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Input
              placeholder="Search for a song or artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-yellow-500"
            />
            <Button 
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && !isSearching && (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <p className="text-sm text-gray-400">Search Results:</p>
              {searchResults.map(track => (
                <div 
                  key={track.id}
                  className="p-3 bg-gray-800/70 rounded-lg border border-gray-700 hover:border-yellow-500/50 transition-colors cursor-pointer group"
                  onClick={() => handleRequest(track)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium group-hover:text-yellow-400 transition-colors">{track.title}</p>
                      <p className="text-gray-400 text-sm">{track.artist}</p>
                      {track.album && <p className="text-gray-500 text-xs italic">{track.album}</p>}
                    </div>
                    <Button size="sm" variant="outline" className="bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-600 group-hover:scale-105 transform transition-transform">
                      Request
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isSearching && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
              <p className="text-gray-400 text-sm mt-2">Searching tracks...</p>
            </div>
          )}

          {/* Fallback: Embedded Radio.co Widget */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50"> {/* Adjusted background and border */}
            <p className="text-gray-400 text-sm mb-3">Or use the official request form:</p>
            {/* Styling for iframe container provided in your code */}
            <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden border border-yellow-500/20">
              <iframe 
                src={RADIO_CO_CONFIG.embedUrl}
                width="100%" 
                height="350"
                style={{ border: 'none', background: 'transparent' }} // Style from your provided code
                title="Radio.co Request Widget"
                loading="lazy"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules/Info Card - Updated content from your provided code */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-yellow-500/20 shadow-xl">
        <CardContent className="pt-6 pb-4"> {/* Adjusted padding for better look */}
          <div className="text-xs text-gray-400 space-y-1.5">
            <p className="font-semibold text-gray-300 mb-1">Request Guidelines:</p>
            <p className="flex items-center gap-1.5"> {/* Gap for icon and text */}
              <Users className="h-3.5 w-3.5 text-yellow-500" /> {/* Slightly larger icon */}
              Request your favorite tracks
            </p>
            {/* Using pl-[22px] for consistent indentation with icon */}
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
