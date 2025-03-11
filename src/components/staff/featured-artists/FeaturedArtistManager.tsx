
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useFeaturedArtists, FeaturedArtistFormData } from "./hooks/useFeaturedArtists";
import { FeaturedArtist } from "@/components/news/types/newsTypes";
import ArtistForm from "./components/ArtistForm";
import { useImageUpload } from "@/components/staff/personalities/hooks/useImageUpload";
import { Loader2, PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ArtistFormValues {
  id?: string;
  name: string;
  bio: string;
  image_url: string;
  website: string;
  spotify: string;
  instagram: string;
  twitter: string;
  youtube: string;
}

const FeaturedArtistManager: React.FC = () => {
  const { toast } = useToast();
  const { artists, loading, isSaving, fetchArtists, createArtist, updateArtist, deleteArtist } = useFeaturedArtists();
  const { imageUrl, setImageUrl, handleImageSelected, isUploading } = useImageUpload();
  const [selectedArtist, setSelectedArtist] = useState<FeaturedArtist | null>(null);

  useEffect(() => {
    fetchArtists();
  }, []);

  useEffect(() => {
    if (selectedArtist) {
      setImageUrl(selectedArtist.image_url || "");
    } else {
      setImageUrl("");
    }
  }, [selectedArtist]);

  const handleCreateNew = () => {
    setSelectedArtist(null);
    setImageUrl("");
  };

  const handleSelectArtist = (artist: FeaturedArtist) => {
    setSelectedArtist(artist);
  };

  const handleSaveArtist = async (values: ArtistFormValues) => {
    // Format the data for the API
    const formData: FeaturedArtistFormData = {
      name: values.name,
      bio: values.bio,
      image_url: imageUrl,
      website: values.website || null,
      social_links: {
        spotify: values.spotify || null,
        instagram: values.instagram || null,
        twitter: values.twitter || null,
        youtube: values.youtube || null
      }
    };

    if (selectedArtist) {
      // Update existing artist
      const updated = await updateArtist(selectedArtist.id, formData);
      if (updated) {
        await fetchArtists();
        setSelectedArtist(updated);
      }
    } else {
      // Create new artist
      const created = await createArtist(formData);
      if (created) {
        await fetchArtists();
        setSelectedArtist(created);
      }
    }
  };

  const handleDeleteArtist = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this artist?")) {
      return;
    }
    
    const success = await deleteArtist(id);
    if (success) {
      await fetchArtists();
      setSelectedArtist(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Featured Artists</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCreateNew}
              className="gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              New
            </Button>
          </div>
          
          <div className="space-y-2">
            {artists.length === 0 ? (
              <Card className="p-4 text-center text-muted-foreground">
                No featured artists yet
              </Card>
            ) : (
              artists.map(artist => (
                <Card 
                  key={artist.id} 
                  className={`p-3 cursor-pointer hover:bg-accent/50 ${selectedArtist?.id === artist.id ? 'border-primary' : ''}`}
                  onClick={() => handleSelectArtist(artist)}
                >
                  <div className="flex items-center gap-3">
                    {artist.image_url ? (
                      <img 
                        src={artist.image_url} 
                        alt={artist.name} 
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <Music className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{artist.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(artist.created_at || "").toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="md:col-span-2">
        <ArtistForm 
          selectedArtist={selectedArtist}
          onSave={handleSaveArtist}
          onDelete={handleDeleteArtist}
          isSaving={isSaving}
          isUploading={isUploading}
          onImageSelected={handleImageSelected}
        />
      </div>
    </div>
  );
};

export default FeaturedArtistManager;
