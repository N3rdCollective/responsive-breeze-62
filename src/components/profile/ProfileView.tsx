
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/types/profile";

interface ProfileViewProps {
  displayName: string;
  username: string;
  bio: string;
  selectedGenres: string[];
  selectedRole: string;
}

const ProfileView = ({
  displayName,
  username,
  bio,
  selectedGenres,
  selectedRole,
}: ProfileViewProps) => {
  // Convert role to a more readable format
  const formatRole = (role: string): string => {
    switch (role) {
      case "user":
        return "Music Fan";
      case "artist":
        return "Artist";
      case "producer":
        return "Producer";
      case "industry_professional":
        return "Industry Professional";
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Username</h3>
          <p className="text-gray-700 dark:text-gray-300">
            {username || "No username set"}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Display Name</h3>
          <p className="text-gray-700 dark:text-gray-300">
            {displayName || "No display name set"}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Bio</h3>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {bio || "No bio provided"}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Role</h3>
          <p className="text-gray-700 dark:text-gray-300">
            {formatRole(selectedRole)}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Favorite Genres</h3>
          {selectedGenres.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedGenres.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-700 dark:text-gray-300">No favorite genres selected</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
