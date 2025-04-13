
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Song = {
  id: string;
  title: string;
  artist: string;
  album?: string;
  year?: string;
};

interface MusicRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MusicRequestModal = ({ open, onOpenChange }: MusicRequestModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [requestedSong, setRequestedSong] = useState<Song | null>(null);
  const { toast } = useToast();
  
  // Mock search function - in a real app, this would call an API
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Mock data - this would be replaced with actual API results
      const mockResults: Song[] = [
        { id: "1", title: "Shape of You", artist: "Ed Sheeran", album: "÷", year: "2017" },
        { id: "2", title: "Good 4 U", artist: "Olivia Rodrigo", album: "SOUR", year: "2021" },
        { id: "3", title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", year: "2020" },
      ].filter(song => 
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 800);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  
  const requestSong = (song: Song) => {
    // In a real implementation, this would send the request to Radio.co's API
    console.log("Requesting song:", song);
    setRequestedSong(song);
    
    // Show success toast
    toast({
      title: "Song Requested",
      description: `Your request for "${song.title}" by ${song.artist} has been submitted.`,
    });
    
    // Clear search and close modal after a short delay
    setTimeout(() => {
      setSearchQuery("");
      setSearchResults([]);
      setRequestedSong(null);
      onOpenChange(false);
    }, 2000);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Request a Song</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="flex w-full items-center space-x-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search for a song or artist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-10"
                disabled={isSearching}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={!searchQuery.trim() || isSearching}
              className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90 dark:bg-[#FFD700] dark:text-black dark:hover:bg-[#FFD700]/90"
            >
              <Search size={18} className="mr-2" />
              Search
            </Button>
          </div>
          
          {isSearching && (
            <div className="mt-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
            </div>
          )}
          
          {!isSearching && searchResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Search Results</h3>
              <div className="space-y-3">
                {searchResults.map((song) => (
                  <div 
                    key={song.id} 
                    className="p-3 border rounded-md flex justify-between items-center bg-background hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="font-medium">{song.title}</p>
                      <p className="text-sm text-muted-foreground">{song.artist} {song.album && `• ${song.album}`} {song.year && `(${song.year})`}</p>
                    </div>
                    <Button 
                      onClick={() => requestSong(song)}
                      disabled={requestedSong?.id === song.id}
                      className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90 dark:bg-[#FFD700] dark:text-black dark:hover:bg-[#FFD700]/90"
                    >
                      {requestedSong?.id === song.id ? "Requested" : "Request"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!isSearching && searchQuery && searchResults.length === 0 && (
            <div className="mt-6 text-center py-8">
              <p className="text-muted-foreground">No songs found matching "{searchQuery}"</p>
              <p className="text-sm mt-2">Try a different search term or check the spelling.</p>
            </div>
          )}
          
          {!searchQuery && !isSearching && searchResults.length === 0 && (
            <div className="mt-6 text-center py-8">
              <p className="text-muted-foreground">Search for your favorite songs or artists</p>
              <p className="text-sm mt-2">We'll find it and add it to our request queue.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MusicRequestModal;
