
import React, { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Upload, UserCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';

interface AvatarUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAvatarUploaded: (newAvatarUrl: string) => void;
  currentAvatarUrl?: string | null;
  displayName?: string | null;
  user: User | null;
}

const AvatarUploadDialog: React.FC<AvatarUploadDialogProps> = ({
  open,
  onOpenChange,
  onAvatarUploaded,
  currentAvatarUrl,
  displayName,
  user,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File is too large. Maximum size is 5MB.');
        setSelectedFile(null);
        setPreviewUrl(currentAvatarUrl || null);
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setError('Invalid file type. Only JPG, PNG, and GIF are allowed.');
        setSelectedFile(null);
        setPreviewUrl(currentAvatarUrl || null);
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      setError('No file selected or user not available.');
      return;
    }
    setIsUploading(true);
    setError(null);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`; // Files stored at the root of the 'avatars' bucket

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true, // Overwrite if file with same name exists (e.g., user re-uploads)
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error('Could not get public URL for avatar.');
      }
      
      // Append a timestamp to bust cache for the new image
      const newAvatarUrlWithCacheBuster = `${publicUrlData.publicUrl}?t=${new Date().getTime()}`;
      onAvatarUploaded(newAvatarUrlWithCacheBuster);
      toast({ title: 'Avatar Uploaded', description: 'Your new avatar is ready.' });
      onOpenChange(false); // Close dialog on success
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      setError(err.message || 'Failed to upload avatar. Please try again.');
      toast({ title: 'Upload Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };
  
  const getInitials = (name?: string | null) => {
    if (!name) return <UserCircle className="h-full w-full text-muted-foreground" />;
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Reset state when dialog opens/closes or currentAvatarUrl changes externally
  React.useEffect(() => {
    if (open) {
      setSelectedFile(null);
      setPreviewUrl(currentAvatarUrl || null);
      setError(null);
    }
  }, [open, currentAvatarUrl]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Profile Picture</DialogTitle>
          <DialogDescription>
            Select a new image for your avatar. Max 5MB. (JPG, PNG, GIF)
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32 border-4 border-primary">
              <AvatarImage src={previewUrl || undefined} alt={displayName || 'Avatar preview'} />
              <AvatarFallback className="text-3xl bg-muted">
                {previewUrl ? getInitials(displayName) : <UserCircle className="h-full w-full text-muted-foreground" />}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              <Upload className="mr-2 h-4 w-4" />
              Choose Image
            </Button>
            <Input
              id="avatarFile"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/jpeg,image/png,image/gif"
              disabled={isUploading}
            />
          </div>
          {error && (
            <div className="text-sm text-destructive flex items-center">
              <AlertCircle className="h-4 w-4 mr-1 inline-block" />
              {error}
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isUploading}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleUpload} disabled={!selectedFile || isUploading || !!error}>
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarUploadDialog;

