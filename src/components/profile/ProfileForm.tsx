
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import GenreSelector from "./GenreSelector";
import type { UserProfile } from "@/types/profile";

interface ProfileFormProps {
  displayName: string;
  username: string;
  bio: string;
  selectedGenres: string[];
  selectedRole: string;
  error: string;
  disabled?: boolean;
  genres: string[];
  onDisplayNameChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onToggleGenre: (genre: string) => void;
  onRoleChange: (value: UserProfile['role']) => void;
}

const ProfileForm = ({
  displayName,
  username,
  bio,
  selectedGenres,
  selectedRole,
  error,
  disabled,
  genres,
  onDisplayNameChange,
  onUsernameChange,
  onBioChange,
  onToggleGenre,
  onRoleChange
}: ProfileFormProps) => {
  return (
    <div className="space-y-6">
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
              onChange={(e) => onUsernameChange(e.target.value)}
              placeholder="Your unique username"
              disabled={disabled}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => onDisplayNameChange(e.target.value)}
              placeholder="How you want to be known"
              disabled={disabled}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => onBioChange(e.target.value)}
            placeholder="Tell the community about yourself"
            rows={4}
            disabled={disabled}
          />
        </div>
        
        <div className="space-y-2">
          <Label>I am a...</Label>
          <Select 
            value={selectedRole} 
            onValueChange={(value: UserProfile['role']) => onRoleChange(value)}
            disabled={disabled}
          >
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
          <GenreSelector
            selectedGenres={selectedGenres}
            onToggleGenre={onToggleGenre}
            genres={genres}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
