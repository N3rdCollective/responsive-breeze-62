
import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const useFileHandler = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl); // Clean up
  }, [selectedFile]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({ title: "File too large", description: `Please select an image smaller than ${MAX_FILE_SIZE_MB}MB.`, variant: "destructive" });
        if(event.target) event.target.value = ""; 
        setSelectedFile(null);
        return;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast({ title: "Invalid file type", description: "Please select a JPG, PNG, GIF, or WEBP image.", variant: "destructive" });
        if(event.target) event.target.value = "";
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  }, [toast]);

  const removeSelectedFile = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  }, []);

  const resetFileState = useCallback(() => {
    removeSelectedFile();
  }, [removeSelectedFile]);

  return {
    selectedFile,
    previewUrl,
    fileInputRef,
    handleFileSelect,
    removeSelectedFile,
    resetFileState,
  };
};
