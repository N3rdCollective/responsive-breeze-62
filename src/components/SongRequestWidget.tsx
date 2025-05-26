
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Music, Search, ThumbsUp, Clock, Users } from 'lucide-react';

// Define a type for the track and request objects for better type safety
interface Track {
  id: number | string;
  title: string;
  artist: string;
  album?: string; // Album is optional as it's only in search results
}

interface RecentRequest extends Track {
  votes: number;
  timeLeft: string;
}

const SongRequestWidget = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([
    { id: 1, title: "Lose Yourself", artist: "Eminem", votes: 12, timeLeft: "5 min" },
    { id: 2, title: "HUMBLE.", artist: "Kendrick Lamar", votes: 8, timeLeft: "12 min" },
    { id: 3, title: "Sicko Mode", artist: "Travis Scott", votes: 6, timeLeft: "18 min" },
  ]);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [requestStatus, setRequestStatus] = useState('');
  
  // Radio.co widget configuration extracted from embed code
  const RADIO_CO_CONFIG = {
    widgetId: 'w34954fe',
    stationName: 'Rappin Lounge Radio',
    confirmationText: 'Your request has been added to the queue.',
    embedUrl: 'https://embed.radio.co/request/w34954fe.html'
  };

  // Function to potentially submit to Radio.co
  const submitToRadioCo = async (track: Track) => {
    try {
      // This is a hypothetical approach - Radio.co doesn't expose this publicly
      // You might need to reverse engineer their form submission or contact them for API access
      
      console.log('Attempting to submit to Radio.co:', {
        widgetId: RADIO_CO_CONFIG.widgetId,
        track: track
      });
      
      // For now, simulate successful submission
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

  // Mock search function
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // This would ideally query Radio.co's track library
      // For now, using mock data that represents your actual library
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
    const radioCoResult = await submitToRadioCo(track);
    
    if (radioCoResult.success) {
      const newRequest: RecentRequest = {
        id: Date.now(), // Using number directly, fits `number | string`
        title: track.title,
        artist: track.artist,
        votes: 1,
        timeLeft: "25 min" // This should ideally be calculated or come from a backend
      };
      setRecentRequests(prev => [newRequest, ...prev.slice(0, 4)]);
    }
    
    setSelectedTrack(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleVote = (requestId: number | string) => {
    setRecentRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, votes: req.votes + 1 }
          : req
      ).sort((a, b) => b.votes - a.votes)
    );
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 my-8">
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
            <div className={`p-3 rounded-lg border ${requestStatus.startsWith('Error') ? 'bg-red-900/20 border-red-500/30 text-red-400' : 'bg-green-900/20 border-green-500/30 text-green-400'}`}>
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
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <p className="text-gray-400 text-sm mb-3">Or use the official request form:</p>
            <div className="relative overflow-hidden rounded-lg"> {/* Ensures iframe border-radius is visible */}
              <iframe 
                src={RADIO_CO_CONFIG.embedUrl}
                width="100%" 
                height="350" // Adjusted height for typical Radio.co widget
                style={{ border: 'none' }} // Removed border radius here as parent div handles it
                title="Radio.co Request Widget"
                loading="lazy" // Added lazy loading
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Queue */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-yellow-500/20 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-yellow-400">
            <Clock className="h-5 w-5" />
            Request Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No requests yet. Be the first!</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {recentRequests.map((request, index) => (
                <div 
                  key={request.id}
                  className="p-3 bg-gray-800/70 rounded-lg border border-gray-700"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <p className="text-white font-medium">{request.title}</p>
                      <p className="text-gray-400 text-sm">{request.artist}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`border-yellow-500 text-yellow-400 ${
                        index === 0 ? 'bg-yellow-500/20 animate-pulse' : 'bg-gray-700/30' 
                      }`}
                    >
                      {index === 0 ? 'Up Next' : `#${index + 1}`}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-3 text-sm"> {/* Adjusted gap */}
                      <span className="text-gray-400 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {/* Adjusted icon size */}
                        {request.timeLeft}
                      </span>
                      <button
                        onClick={() => handleVote(request.id)}
                        className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 transition-colors group"
                      >
                        <ThumbsUp className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" /> {/* Adjusted icon size */}
                        {request.votes}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rules/Info */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-yellow-500/20 shadow-xl">
        <CardContent className="pt-6 pb-4">
          <div className="text-xs text-gray-400 space-y-1.5">
            <p className="font-semibold text-gray-300 mb-1">Request Guidelines:</p>
            <p className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-yellow-500" />
              Max 3 requests/listener/hour.
            </p>
            <p className="pl-[22px]">Requests expire after 30 mins if not played.</p>
            <p className="pl-[22px]">Most voted tracks play first.</p>
            <p className="pl-[22px]">Explicit content may be filtered.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SongRequestWidget;

