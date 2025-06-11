
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UserCircle, AlertTriangle, EyeOff, ChevronLeft } from 'lucide-react';
import { fetchPublicUserProfileByUsername, PublicUserProfileData } from '@/services/profileService';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

const PublicProfilePage: React.FC = () => {
  const { username, userId } = useParams<{ username?: string; userId?: string }>();
  const [profile, setProfile] = useState<PublicUserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (username) {
          // Load by username (new route format /u/:username)
          const data = await fetchPublicUserProfileByUsername(username);
          setProfile(data);
        } else if (userId) {
          // Load by userId (legacy route format /profile/:userId) 
          const { data, error } = await supabase
            .from('profiles')
            .select('id, username, display_name, bio, role, created_at, is_public, profile_picture')
            .eq('id', userId)
            .single();
          
          if (error) throw error;
          
          if (data) {
            setProfile({
              id: data.id,
              username: data.username,
              display_name: data.display_name,
              bio: data.bio,
              role: data.role,
              created_at: data.created_at,
              is_public: data.is_public,
              avatar_url: data.profile_picture
            });
          }
        } else {
          throw new Error('No username or user ID provided');
        }
      } catch (err) {
        console.error("Error fetching public profile:", err);
        setError("Failed to load profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (username || userId) {
      loadProfile();
    } else {
      setError("No username or user ID provided.");
      setLoading(false);
    }
  }, [username, userId]);

  const getInitials = (name?: string | null) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen pt-20 pb-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading profile...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen pt-20 pb-10 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button asChild variant="link" className="mt-4">
            <Link to="/">Go back to Home</Link>
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen pt-20 pb-10 text-center">
          <UserCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground">The user profile for @{username || userId} could not be found.</p>
          <Button asChild variant="link" className="mt-4">
            <Link to="/">Go back to Home</Link>
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  if (!profile.is_public) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen pt-20 pb-10 text-center">
          <EyeOff className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Profile is Private</h2>
          <p className="text-muted-foreground">The profile for @{profile.username} is private.</p>
           <Button asChild variant="link" className="mt-4">
            <Link to="/">Go back to Home</Link>
          </Button>
        </div>
        <Footer />
      </>
    );
  }
  
  // Safely format join date
  let joinDateFormatted = 'N/A';
  if (profile.created_at) {
    try {
      joinDateFormatted = format(new Date(profile.created_at), 'MMMM d, yyyy');
    } catch (e) {
      console.error("Error formatting date:", e);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto px-4 py-10 pt-20">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/members">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="shadow-lg">
              <CardHeader className="flex flex-col items-center text-center pt-8 pb-4 bg-muted/30">
                <Avatar className="h-32 w-32 mb-4 border-4 border-primary shadow-md">
                  <AvatarImage src={profile.avatar_url || undefined} alt={profile.display_name || profile.username} />
                  <AvatarFallback className="text-4xl bg-muted">
                    {profile.avatar_url ? getInitials(profile.display_name || profile.username) : <UserCircle className="h-20 w-20" />}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-3xl font-bold">{profile.display_name || profile.username}</h1>
                <p className="text-md text-muted-foreground">@{profile.username}</p>
              </CardHeader>
              <CardContent className="pt-6 space-y-3 text-sm">
                {profile.role && (
                  <div className="flex items-center">
                    <Badge variant="secondary" className="capitalize text-xs">{profile.role.replace(/_/g, ' ')}</Badge>
                  </div>
                )}
                <div>
                  <span className="font-semibold">Joined:</span> {joinDateFormatted}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">About {profile.display_name || profile.username}</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.bio ? (
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
                ) : (
                  <p className="text-muted-foreground italic">This user hasn't shared a bio yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PublicProfilePage;
