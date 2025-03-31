
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ArtistForm from "./components/ArtistForm";
import { FormValues } from "./components/ArtistForm";
import ArtistList from "./components/ArtistList";
import { FeaturedArtist } from "@/components/news/types/newsTypes";
import { useFeaturedArtists } from "./hooks/useFeaturedArtists";
import { useImageUpload } from "./hooks/useImageUpload";
import { useToast } from "@/hooks/use-toast";

const FeaturedArtistManager: React.FC = () => {
  const [selectedArtist, setSelectedArtist] = useState<FeaturedArtist | null>(null);
  const [tab, setTab] = useState<string>("active");
  const activeArtistsHook = useFeaturedArtists(false); // Active artists
  const archivedArtistsHook = useFeaturedArtists(true); // Archived artists
  const { uploadImage, isUploading, uploadProgress, uploadError } = useImageUpload();
  const { toast } = useToast();
  
  // Get the correct hook based on the current tab
  const currentHook = tab === "active" ? activeArtistsHook : archivedArtistsHook;
  const { 
    artists, 
    loading, 
    isSaving, 
    fetchArtists, 
    createArtist, 
    updateArtist, 
    deleteArtist, 
    archiveArtist,
    restoreArtist 
  } = currentHook;

  // Fetch artists when the component mounts or the tab changes
  useEffect(() => {
    console.log("Fetching artists, tab:", tab, "isArchived:", tab === "archived");
    fetchArtists();
  }, [tab, fetchArtists]);

  const handleSelectArtist = (artist: FeaturedArtist) => {
    console.log("Selected artist:", artist);
    setSelectedArtist(artist);
  };

  const handleNewArtist = () => {
    setSelectedArtist(null);
    setTab("active"); // Switch to active tab when creating new artist
  };

  const handleImageSelected = async (file: File): Promise<string | null> => {
    try {
      const imageUrl = await uploadImage(file);
      if (!imageUrl) {
        toast({
          title: "Upload failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive"
        });
        return null;
      }
      return imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload error",
        description: "An error occurred while uploading the image",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleSaveArtist = async (values: any) => {
    const formData = {
      name: values.name,
      bio: values.bio,
      image_url: values.image_url,
      website: values.website || null,
      social_links: {
        spotify: values.spotify || null,
        instagram: values.instagram || null,
        twitter: values.twitter || null,
        youtube: values.youtube || null
      }
    };
    
    console.log("Saving artist data:", formData);
    
    try {
      if (selectedArtist) {
        await updateArtist(selectedArtist.id, formData);
      } else {
        const newArtist = await createArtist(formData);
        if (newArtist) {
          setSelectedArtist(newArtist);
        }
      }
      
      await fetchArtists();
      toast({
        title: selectedArtist ? "Artist Updated" : "Artist Created",
        description: `Successfully ${selectedArtist ? "updated" : "created"} ${formData.name}`,
      });
    } catch (error) {
      console.error("Error saving artist:", error);
      toast({
        title: "Error",
        description: "There was a problem saving the artist information",
        variant: "destructive"
      });
    }
  };

  const handleDeleteArtist = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this artist? This action cannot be undone.")) {
      await deleteArtist(id);
      setSelectedArtist(null);
      await fetchArtists();
    }
  };

  const handleArchiveArtist = async (id: string) => {
    await archiveArtist(id);
    setSelectedArtist(null);
    await fetchArtists();
  };

  const handleRestoreArtist = async (id: string) => {
    await restoreArtist(id);
    setSelectedArtist(null);
    await fetchArtists();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Artists</h3>
          <Button onClick={handleNewArtist} size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            New Artist
          </Button>
        </div>
        
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 w-full">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-0">
            <ScrollArea className="h-[calc(100vh-320px)] pr-4">
              <ArtistList 
                artists={artists}
                loading={loading}
                onSelectArtist={handleSelectArtist}
                selectedArtistId={selectedArtist?.id}
              />
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="archived" className="mt-0">
            <ScrollArea className="h-[calc(100vh-320px)] pr-4">
              <ArtistList 
                artists={artists}
                loading={loading}
                onSelectArtist={handleSelectArtist}
                selectedArtistId={selectedArtist?.id}
                isArchived
              />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="md:col-span-2">
        <ArtistForm 
          selectedArtist={selectedArtist}
          onSave={handleSaveArtist}
          onDelete={handleDeleteArtist}
          onArchive={tab === "active" ? handleArchiveArtist : undefined}
          onRestore={tab === "archived" ? handleRestoreArtist : undefined}
          isSaving={isSaving}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          uploadError={uploadError}
          onImageSelected={handleImageSelected}
        />
      </div>
    </div>
  );
};

export default FeaturedArtistManager;
