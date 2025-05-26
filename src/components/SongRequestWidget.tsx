
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
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null); // Added type
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([ // Added type
    { id: 1, title: "Lose Yourself", artist: "Eminem", votes: 12, timeLeft: "5 min" },
    { id: 2, title: "HUMBLE.", artist: "Kendrick Lamar", votes: 8, timeLeft: "12 min" },
    { id: 3, title: "Sicko Mode", artist: "Travis Scott", votes: 6, timeLeft: "18 min" },
  ]);
  const [searchResults, setSearchResults] = useState<Track[]>([]); // Added type
  const [isSearching, setIsSearching] = useState(false);

  // Mock search function - in real implementation, this would query your media library
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      const mockResults: Track[] = [ // Added type
        { id: 101, title: "God's Plan", artist: "Drake", album: "Scorpion" },
        { id: 102, title: "MONEY", artist: "Cardi B", album: "Invasion of Privacy" },
        { id: 103, title: "Nice For What", artist: "Drake", album: "Scorpion" },
      ].filter(track => 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 800);
  };

  const handleRequest = (track: Track) => { // Added type
    // In real implementation, this would submit to Radio.co or your backend
    console.log('Requesting track:', track);
    
    // Add to recent requests (mock)
    const newRequest: RecentRequest = { // Added type
      id: Date.now().toString(), // Changed to string for consistency if Date.now() is used
      title: track.title,
      artist: track.artist,
      votes: 1,
      timeLeft: "25 min" // This should ideally be calculated or come from a backend
    };
    setRecentRequests(prev => [newRequest, ...prev.slice(0, 4)]);
    setSelectedTrack(null); // Reset selected track
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleVote = (requestId: number | string) => { // Added type
    setRecentRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, votes: req.votes + 1 }
          : req
      ).sort((a, b) => b.votes - a.votes)
    );
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 my-8"> {/* Added my-8 for spacing */}
      {/* Request Form */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-yellow-500/20 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-yellow-400">
            <Music className="h-5 w-5" />
            Request a Track
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1"> {/* Added max-h and overflow */}
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
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1"> {/* Added max-h and overflow */}
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
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {request.timeLeft}
                      </span>
                      <button
                        onClick={() => handleVote(request.id)}
                        className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 transition-colors group"
                      >
                        <ThumbsUp className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
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
        <CardContent className="pt-6 pb-4"> {/* Adjusted padding */}
          <div className="text-xs text-gray-400 space-y-1.5"> {/* Increased spacing */}
            <p className="font-semibold text-gray-300 mb-1">Request Guidelines:</p>
            <p className="flex items-center gap-1.5"> {/* Adjusted gap */}
              <Users className="h-3.5 w-3.5 text-yellow-500" /> {/* Styled icon */}
              Max 3 requests/listener/hour.
            </p>
            <p className="pl-[22px]">Requests expire after 30 mins if not played.</p> {/* Aligned with icon */}
            <p className="pl-[22px]">Most voted tracks play first.</p>
            <p className="pl-[22px]">Explicit content may be filtered.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SongRequestWidget;

