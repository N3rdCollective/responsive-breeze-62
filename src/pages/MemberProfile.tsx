import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, LogOut, User, Mail, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Profile } from "@/types/supabase";

const MemberProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          navigate("/login", { state: { from: { pathname: "/profile" } } });
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          throw new Error("Failed to load profile data.");
        }
        
        setProfile(profileData as Profile);
        setDisplayName(profileData.display_name || "");
        setBio(profileData.bio || "");
      } catch (error: any) {
        console.error("Profile error:", error);
        setError(error.message || "An error occurred while loading your profile.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [navigate]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleSaveProfile = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          bio: bio,
        })
        .eq("id", profile.id);
        
      if (updateError) throw updateError;
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
      
      setProfile({
        ...profile,
        display_name: displayName,
        bio: bio,
      });
    } catch (error: any) {
      console.error("Profile update error:", error);
      setError(error.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    
    setIsUploadingImage(true);
    setError(null);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          profile_picture: publicUrlData.publicUrl,
        })
        .eq("id", profile.id);
        
      if (updateError) throw updateError;
      
      setProfile({
        ...profile,
        profile_picture: publicUrlData.publicUrl,
      });
      
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Image upload error:", error);
      setError(error.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">My Profile</h1>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.profile_picture || ""} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : <User />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2">
                    <div className="relative">
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="h-8 w-8 rounded-full"
                        disabled={isUploadingImage}
                      >
                        {isUploadingImage ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-center sm:text-left">
                  <h2 className="text-2xl font-bold">{profile?.display_name || "Member"}</h2>
                  <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1 justify-center sm:justify-start">
                      <Mail className="h-4 w-4" />
                      <span>{profile?.id}</span>
                    </div>
                    {profile?.role && (
                      <div className="flex items-center gap-1 justify-center sm:justify-start">
                        <User className="h-4 w-4" />
                        <span className="capitalize">{profile.role}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isSaving}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px]"
                  disabled={isSaving}
                />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                onClick={handleSaveProfile} 
                className="ml-auto bg-[#FFD700] hover:bg-[#FFD700]/90 text-black"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MemberProfile;
