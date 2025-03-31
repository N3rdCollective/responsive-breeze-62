
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Loader2, Trash, Archive } from "lucide-react";
import { FeaturedArtist } from "@/components/news/types/newsTypes";
import ImageUploader from "./ImageUploader";
import SocialLinksSection from "./SocialLinksSection";

interface FormValues {
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

interface ArtistFormProps {
  selectedArtist: FeaturedArtist | null;
  onSave: (values: FormValues) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  isSaving: boolean;
  isUploading?: boolean;
  onImageSelected: (file: File) => void;
}

const ArtistForm: React.FC<ArtistFormProps> = ({
  selectedArtist,
  onSave,
  onDelete,
  onArchive,
  isSaving,
  isUploading = false,
  onImageSelected
}) => {
  const defaultValues: FormValues = {
    name: "",
    bio: "",
    image_url: "",
    website: "",
    spotify: "",
    instagram: "",
    twitter: "",
    youtube: ""
  };

  const form = useForm<FormValues>({
    defaultValues: selectedArtist ? {
      id: selectedArtist.id,
      name: selectedArtist.name,
      bio: selectedArtist.bio,
      image_url: selectedArtist.image_url || "",
      website: selectedArtist.website || "",
      spotify: selectedArtist.social_links?.spotify || "",
      instagram: selectedArtist.social_links?.instagram || "",
      twitter: selectedArtist.social_links?.twitter || "",
      youtube: selectedArtist.social_links?.youtube || ""
    } : defaultValues
  });

  const isEditing = !!selectedArtist;
  const isArchived = selectedArtist?.is_archived;
  const title = isEditing 
    ? isArchived 
      ? "Archived Artist" 
      : "Edit Featured Artist" 
    : "Create New Featured Artist";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSave)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Artist name" disabled={isArchived} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biography</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Artist biography" 
                      className="min-h-[120px]"
                      disabled={isArchived}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://example.com" disabled={isArchived} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ImageUploader 
              currentImageUrl={form.watch("image_url")}
              onImageSelected={onImageSelected}
              onImageUrlChange={(url) => form.setValue("image_url", url)}
              isUploading={isUploading}
              disabled={isArchived}
            />

            <SocialLinksSection 
              spotifyValue={form.watch("spotify")}
              onSpotifyChange={(value) => form.setValue("spotify", value)}
              instagramValue={form.watch("instagram")}
              onInstagramChange={(value) => form.setValue("instagram", value)}
              twitterValue={form.watch("twitter")}
              onTwitterChange={(value) => form.setValue("twitter", value)}
              youtubeValue={form.watch("youtube")}
              onYoutubeChange={(value) => form.setValue("youtube", value)}
              disabled={isArchived}
            />
          </CardContent>
          <CardFooter className="flex justify-between flex-wrap gap-2">
            {isEditing && (
              <div className="flex gap-2">
                {onDelete && !isArchived && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => selectedArtist && onDelete(selectedArtist.id)}
                    disabled={isSaving || isUploading}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
                
                {onArchive && !isArchived && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => selectedArtist && onArchive(selectedArtist.id)}
                    disabled={isSaving || isUploading}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                )}
              </div>
            )}
            <div className={isEditing ? "ml-auto" : "w-full"}>
              {!isArchived && (
                <Button 
                  type="submit" 
                  disabled={isSaving || isUploading}
                  className={!isEditing ? "w-full" : ""}
                >
                  {(isSaving || isUploading) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditing ? 'Save Changes' : 'Create Artist'}
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ArtistForm;
