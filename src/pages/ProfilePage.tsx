
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import ProfileForm from "@/components/profile/ProfileForm";

const genres = [
  "Hip Hop", "Rap", "R&B", "Trap", "Drill", "Pop", "Rock", "Electronic", 
  "Jazz", "Soul", "Funk", "Reggae", "Dancehall", "Afrobeats", "Latin", "Other"
];

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const {
    isLoading,
    isSaving,
    error,
    displayName,
    username,
    bio,
    selectedGenres,
    selectedRole,
    setDisplayName,
    setUsername,
    setBio,
    setSelectedGenres,
    setSelectedRole,
    handleSaveProfile
  } = useProfile(user);
  
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);
  
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
          
          <CardContent>
            <ProfileForm
              displayName={displayName}
              username={username}
              bio={bio}
              selectedGenres={selectedGenres}
              selectedRole={selectedRole}
              error={error}
              disabled={isSaving}
              genres={genres}
              onDisplayNameChange={setDisplayName}
              onUsernameChange={setUsername}
              onBioChange={setBio}
              onToggleGenre={toggleGenre}
              onRoleChange={setSelectedRole}
            />
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
