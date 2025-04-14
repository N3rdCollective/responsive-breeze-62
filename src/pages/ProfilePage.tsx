
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  favorite_genres: string[] | null;
  avatar_url: string | null;
  role: 'user' | 'artist' | 'producer' | 'industry_professional';
}

const genres = [
  "Hip Hop", "Rap", "R&B", "Trap", "Drill", "Pop", "Rock", "Electronic", 
  "Jazz", "Soul", "Funk", "Reggae", "Dancehall", "Afrobeats", "Latin", "Other"
];

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  
  // Form state
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("user");
  
  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);
  
  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        // Use more generic query approach to avoid TypeScript errors with table types
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Explicitly type the data to match UserProfile interface
          const userProfile: UserProfile = {
            id: data.id,
            username: data.username || "",
            display_name: data.display_name,
            bio: data.bio,
            favorite_genres: data.favorite_genres,
            avatar_url: data.avatar_url,
            role: data.role || "user"
          };
          
          setProfile(userProfile);
          setDisplayName(userProfile.display_name || "");
          setUsername(userProfile.username || "");
          setBio(userProfile.bio || "");
          setSelectedGenres(userProfile.favorite_genres || []);
          setSelectedRole(userProfile.role);
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error.message);
        setError("Failed to load profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setError("");
    
    try {
      // Check if username is taken by another user
      if (username !== profile?.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .neq('id', user.id)
          .single();
          
        if (!checkError && existingUser) {
          throw new Error("Username is already taken. Please choose another one.");
        }
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          display_name: displayName,
          bio,
          favorite_genres: selectedGenres,
          role: selectedRole as UserProfile['role'],
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };
  
  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Manage your profile information and preferences
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your unique username"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="How you want to be known"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the community about yourself"
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label>I am a...</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Music Fan</SelectItem>
                    <SelectItem value="artist">Artist</SelectItem>
                    <SelectItem value="producer">Producer</SelectItem>
                    <SelectItem value="industry_professional">Industry Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Favorite Genres</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {genres.map((genre) => (
                    <Button
                      key={genre}
                      type="button"
                      variant={selectedGenres.includes(genre) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={handleSaveProfile} 
              disabled={isSaving}
              className="ml-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
