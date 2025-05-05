
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft, Home, Edit, Eye } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileView from "@/components/profile/ProfileView";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

const genres = [
  "Hip Hop", "Rap", "R&B", "Trap", "Drill", "Pop", "Rock", "Electronic", 
  "Jazz", "Soul", "Funk", "Reggae", "Dancehall", "Afrobeats", "Latin", "Other"
];

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(true); // Default to edit mode
  
  const {
    isLoading,
    isSaving,
    error,
    profile,
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
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      console.log("User not authenticated, redirecting to auth page");
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
  
  const handleSave = async () => {
    try {
      await handleSaveProfile();
      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully"
      });
      setIsEditMode(false);
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };
  
  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Make sure we're logged in before showing the profile
  if (!user) {
    return null; // Will redirect in the useEffect
  }
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Website
          </Button>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>
                {isEditMode 
                  ? "Edit your profile information and preferences"
                  : "View your profile information and preferences"}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
              className="ml-auto"
            >
              {isEditMode ? (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  View Mode
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </CardHeader>
          
          <CardContent>
            {isEditMode ? (
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
            ) : (
              <ProfileView
                displayName={displayName}
                username={username}
                bio={bio}
                selectedGenres={selectedGenres}
                selectedRole={selectedRole}
              />
            )}
          </CardContent>
          
          {isEditMode && (
            <CardFooter>
              <Button 
                onClick={handleSave} 
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
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
