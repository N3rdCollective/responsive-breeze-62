import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Avatar,
  AvatarImage,
  AvatarFallback 
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from "@/hooks/useAuth";
import { useProfileData } from "@/hooks/profile/useProfileData";
import { useProfileFormFields } from "@/hooks/profile/useProfileFormFields";
import { useProfileSave } from "@/hooks/profile/useProfileSave";
import { useThemeSync } from "@/hooks/profile/useThemeSync";
import type { ProfileDataToSave } from "@/hooks/profile/useProfileSave";
import type { UserProfile } from "@/types/profile";
import { AlertCircle, Loader2, ChevronLeft, Camera, Music, Save, Eye, Paintbrush, UserCircle, Edit } from 'lucide-react';
import { Instagram, Twitter, Globe } from 'lucide-react';
import Navbar from "@/components/Navbar";
import AvatarUploadDialog from "@/components/profile/AvatarUploadDialog";

// Genre data (expanded) - consider moving to a constants file if used elsewhere
const genres = [
  'Rock', 'Pop', 'Hip-Hop', 'R&B', 'Jazz', 'Blues', 
  'Electronic', 'Classical', 'Country', 'Folk', 'Metal', 
  'Punk', 'Indie', 'Alternative', 'Reggae', 'Soul', 
  'Funk', 'Disco', 'House', 'Techno', 'Ambient', 'Lo-fi'
];

// Available roles - ensure these align with UserProfile type
const roles: UserProfile['role'][] = [ // Typed for safety
  'user', 'artist', 'producer', 'industry_professional'
];

// Theme options aligned with application theme
const themes = [
  { id: 'light', name: 'Light Mode', color: 'bg-background dark:bg-foreground' },
  { id: 'dark', name: 'Dark Mode', color: 'bg-slate-800' },
  { id: 'system', name: 'System Default', color: 'bg-gradient-to-r from-slate-300 to-slate-500 dark:from-slate-700 dark:to-slate-900' }
];

const EnhancedProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { 
    profile, 
    defaultUsernameForNewUser, 
    isNewUserMode, 
    isLoading: profileLoading, 
    error: fetchProfileError, 
    refetchProfile 
  } = useProfileData(user);

  const {
    displayName, setDisplayName,
    username, setUsername,
    bio, setBio,
    selectedGenres, setSelectedGenres,
    selectedRole, setSelectedRole,
    socialLinks, setSocialLinks,
    theme, setTheme,
    isPublic, setIsPublic,
    avatarUrl, setAvatarUrl,
    forumSignature, setForumSignature,
    getProfileFormData
  } = useProfileFormFields({
    profileData: profile,
    defaultUsernameForNewUser,
    isNewUserMode,
    userEmail: user?.email 
  });
  
  // Sync the profile theme with the application theme system
  const { appTheme, updateTheme } = useThemeSync(profile?.theme, setTheme);

  const { 
    handleSaveProfile: execSaveProfile, 
    isSaving, 
    error: saveProfileError,
  } = useProfileSave(user, profile?.username);

  const [activeTab, setActiveTab] = useState('edit');
  const [showGenreSelector, setShowGenreSelector] = useState(false);
  const [isAvatarUploadOpen, setIsAvatarUploadOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      console.log("User not authenticated, redirecting or showing message...");
      // Auth handling should be managed globally or by Navbar
    }
  }, [user, authLoading, navigate]);

  const handleSave = async () => {
    const formData = getProfileFormData();
    try {
      const result = await execSaveProfile(formData as ProfileDataToSave);
      if (result) { 
        setActiveTab('view');
        refetchProfile();
      }
    } catch (err) {
      // Error toast is handled within useProfileSave
      console.error("Error saving from page:", err);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const toggleGenre = (genre: string) => {
    if (isSaving) return;
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const updateSocialLink = (platform: 'instagram' | 'twitter' | 'website', value: string) => {
    if (isSaving) return;
    setSocialLinks(prev => ({ ...(prev || { instagram: null, twitter: null, website: null }), [platform]: value }));
  };
  
  const getInitials = (name?: string | null) => {
    if (!name) return <UserCircle className="h-full w-full" />;
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleAvatarUploaded = (newAvatarUrl: string) => {
    setAvatarUrl(newAvatarUrl);
  };

  const pageError = fetchProfileError || saveProfileError;

  if (profileLoading || authLoading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading profile...</span>
        </div>
      </>
    );
  }
  
  if (!user) {
     return (
      <>
        <Navbar />
        <div className="flex flex-col justify-center items-center h-screen">
          <p className="mb-4">Please sign in to view your profile.</p>
        </div>
      </>
    );
  }
  
  const displayAvatarUrl = avatarUrl !== null ? avatarUrl : profile?.avatar_url;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto px-4 py-10 pt-20">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-6"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="flex flex-col items-center pt-6 pb-2">
                <div className="relative group">
                  <Avatar className="h-24 w-24 mb-2 border-4 border-primary">
                    <AvatarImage src={displayAvatarUrl || undefined} alt={displayName || "User"} />
                    <AvatarFallback className="text-lg bg-muted">
                      {getInitials(displayName)} 
                    </AvatarFallback>
                  </Avatar>
                  {activeTab === 'edit' && (
                    <div className="absolute bottom-0 right-0">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="rounded-full h-8 w-8 p-0" 
                        title="Change Avatar"
                        onClick={() => setIsAvatarUploadOpen(true)}
                        disabled={isSaving}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold mt-2">{displayName}</h2>
                <div className="text-sm text-muted-foreground">@{username}</div>
                <div className="flex items-center mt-2">
                  <Music className="h-4 w-4 mr-1 text-primary" />
                  <span className="text-sm">{selectedRole === 'user' ? 'Music Fan' : selectedRole === 'artist' ? 'Artist' : selectedRole === 'producer' ? 'Producer' : selectedRole === 'industry_professional' ? 'Industry Professional' : selectedRole}</span>
                </div>
              </CardHeader>
              <CardContent className="text-center pb-6">
                {selectedGenres.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1 mt-3">
                    {selectedGenres.slice(0, 5).map(genre => (
                      <Badge key={genre} variant="secondary" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                    {selectedGenres.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{selectedGenres.length - 5} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex justify-center mt-4 space-x-3">
                  {socialLinks?.instagram && (
                    <a href={`https://instagram.com/${socialLinks.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost" className="rounded-full h-8 w-8 p-0">
                        <Instagram className="h-4 w-4 text-foreground" />
                      </Button>
                    </a>
                  )}
                  {socialLinks?.twitter && (
                     <a href={`https://twitter.com/${socialLinks.twitter.replace('@','')}`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost" className="rounded-full h-8 w-8 p-0">
                        <Twitter className="h-4 w-4 text-foreground" />
                      </Button>
                    </a>
                  )}
                  {socialLinks?.website && (
                     <a href={socialLinks.website.startsWith('http') ? socialLinks.website : `https://${socialLinks.website}`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost" className="rounded-full h-8 w-8 p-0">
                        <Globe className="h-4 w-4 text-foreground" />
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Your Profile</h2>
                    <TabsList>
                      <TabsTrigger value="edit" className="flex items-center">
                        <Paintbrush className="mr-1 h-4 w-4" />
                        Edit
                      </TabsTrigger>
                      <TabsTrigger value="view" className="flex items-center">
                        <Eye className="mr-1 h-4 w-4" />
                        Preview
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </CardHeader>
                
                <TabsContent value="edit" className="m-0">
                  <CardContent className="pt-4">
                    {pageError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{pageError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Your unique username"
                            disabled={isSaving}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="displayName">Display Name</Label>
                          <Input
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Your display name"
                            disabled={isSaving}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell us about yourself..."
                          rows={3}
                          disabled={isSaving}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="forumSignature">Forum Signature</Label>
                        <Textarea
                          id="forumSignature"
                          value={forumSignature}
                          onChange={(e) => setForumSignature(e.target.value)}
                          placeholder="Your signature for forum posts (optional)"
                          rows={2}
                          disabled={isSaving}
                        />
                        <p className="text-xs text-muted-foreground">This will appear below your posts in the forum.</p>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="role">Role</Label>
                        <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserProfile['role'])} disabled={isSaving}>
                          <SelectTrigger id="role">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r === 'user' ? 'Music Fan' : 
                                 r === 'artist' ? 'Artist' : 
                                 r === 'producer' ? 'Producer' : 
                                 r === 'industry_professional' ? 'Industry Professional' : r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <Label>Favorite Genres ({selectedGenres.length})</Label>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowGenreSelector(!showGenreSelector)}
                            disabled={isSaving}
                          >
                            {showGenreSelector ? 'Hide' : `Show All (${genres.length})`}
                          </Button>
                        </div>
                        
                        <div className={`flex flex-wrap gap-2 pt-1 ${showGenreSelector ? 'max-h-48 overflow-y-auto' : 'max-h-20 overflow-hidden'}`}>
                          {genres.map((genre) => (
                            <Badge 
                              key={genre}
                              variant={selectedGenres.includes(genre) ? "default" : "outline"}
                              className="cursor-pointer hover:bg-accent"
                              onClick={() => toggleGenre(genre)}
                            >
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <h3 className="text-base font-medium mb-2">Social Media</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <div className="space-y-1">
                            <Label htmlFor="instagram" className="flex items-center text-sm">
                              <Instagram className="h-4 w-4 mr-1 text-pink-500" />
                              Instagram
                            </Label>
                            <div className="flex">
                              <span className="px-2 py-2 border border-r-0 rounded-l-md text-sm bg-muted text-muted-foreground">@</span>
                              <Input
                                id="instagram"
                                value={socialLinks?.instagram || ''}
                                onChange={(e) => updateSocialLink('instagram', e.target.value)}
                                className="rounded-l-none"
                                disabled={isSaving}
                                placeholder="username"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="twitter" className="flex items-center text-sm">
                              <Twitter className="h-4 w-4 mr-1 text-blue-400" />
                              Twitter / X
                            </Label>
                            <div className="flex">
                              <span className="px-2 py-2 border border-r-0 rounded-l-md text-sm bg-muted text-muted-foreground">@</span>
                              <Input
                                id="twitter"
                                value={socialLinks?.twitter || ''}
                                onChange={(e) => updateSocialLink('twitter', e.target.value)}
                                className="rounded-l-none"
                                disabled={isSaving}
                                placeholder="username"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="website" className="flex items-center text-sm">
                              <Globe className="h-4 w-4 mr-1 text-green-500" />
                              Website
                            </Label>
                            <Input
                              id="website"
                              value={socialLinks?.website || ''}
                              onChange={(e) => updateSocialLink('website', e.target.value)}
                              disabled={isSaving}
                              placeholder="yourdomain.com"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <h3 className="text-base font-medium mb-2">Appearance</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {themes.map((themeOption) => (
                            <div 
                              key={themeOption.id}
                              onClick={() => !isSaving && updateTheme(themeOption.id)}
                              className={`cursor-pointer p-2 rounded-md border-2 transition-all ${isSaving ? 'opacity-50 cursor-not-allowed' : ''} ${
                                theme === themeOption.id ? 'border-primary scale-105 shadow-lg' : 'border-transparent hover:border-accent'
                              }`}
                            >
                              <div className={`${themeOption.color} h-8 w-full rounded mb-1 shadow-inner`}></div>
                              <div className="text-center text-xs">{themeOption.name}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <h3 className="text-base font-medium mb-1">Privacy</h3>
                        <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors">
                          <Label htmlFor="public-profile" className="flex-1 cursor-pointer">
                            <span className="font-normal">Public Profile</span>
                            <span className="text-xs text-muted-foreground block font-light">Allow others to discover and view your profile.</span>
                          </Label>
                          <Switch
                            id="public-profile"
                            checked={isPublic}
                            onCheckedChange={setIsPublic}
                            disabled={isSaving}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4 mt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('view')}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving || profileLoading}
                      className="flex items-center"
                    >
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-1.5 h-4 w-4" />
                      Save Changes
                    </Button>
                  </CardFooter>
                </TabsContent>

                <TabsContent value="view" className="m-0">
                  <CardContent className="pt-4">
                    <div className="prose max-w-none dark:prose-invert">
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-1">About Me</h3>
                        <p className="whitespace-pre-line text-sm">{bio || <span className="italic text-muted-foreground">No bio provided yet.</span>}</p>
                      </div>

                      {forumSignature && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-2 flex items-center">
                            <Edit className="h-4 w-4 mr-2 text-primary" />
                            Forum Signature
                          </h3>
                          <blockquote className="border-l-4 border-primary pl-4 italic text-sm text-muted-foreground">
                            {forumSignature.split('\n').map((line, index) => (
                              <React.Fragment key={index}>
                                {line}
                                {index < forumSignature.split('\n').length -1 && <br />}
                              </React.Fragment>
                            ))}
                          </blockquote>
                        </div>
                      )}
                      
                      {selectedGenres.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-2">Favorite Genres</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedGenres.map(genre => (
                              <Badge key={genre} variant="secondary">
                                {genre}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Connect</h3>
                        <div className="flex flex-col space-y-2">
                          {socialLinks?.instagram && (
                            <a href={`https://instagram.com/${socialLinks.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm hover:text-primary transition-colors">
                              <Instagram className="h-4 w-4 mr-2 text-pink-500" />
                              @{socialLinks.instagram.replace('@','')}
                            </a>
                          )}
                          {socialLinks?.twitter && (
                            <a href={`https://twitter.com/${socialLinks.twitter.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm hover:text-primary transition-colors">
                              <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                              @{socialLinks.twitter.replace('@','')}
                            </a>
                          )}
                          {socialLinks?.website && (
                             <a href={socialLinks.website && socialLinks.website.startsWith('http') ? socialLinks.website : `https://${socialLinks.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm hover:text-primary transition-colors">
                              <Globe className="h-4 w-4 mr-2 text-green-500" />
                              {socialLinks.website}
                            </a>
                          )}
                          {!socialLinks?.instagram && !socialLinks?.twitter && !socialLinks?.website && (
                            <span className="text-sm italic text-muted-foreground">No social links provided.</span>
                          )}
                        </div>
                      </div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-1">Profile Visibility</h3>
                        <p className="text-sm">
                          This profile is currently <strong>{isPublic ? 'Public' : 'Private'}</strong>.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end border-t pt-4 mt-2">
                    <Button onClick={() => setActiveTab('edit')}>
                      <Paintbrush className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </CardFooter>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
      {user && (
        <AvatarUploadDialog
          open={isAvatarUploadOpen}
          onOpenChange={setIsAvatarUploadOpen}
          onAvatarUploaded={handleAvatarUploaded}
          currentAvatarUrl={displayAvatarUrl}
          displayName={displayName}
          user={user}
        />
      )}
    </div>
  );
};

export default EnhancedProfilePage;
