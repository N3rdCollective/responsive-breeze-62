
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, X, Check, Upload, Image, Link } from "lucide-react";
import { SponsorFormData } from "../types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SponsorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  formData: SponsorFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSwitchChange: (checked: boolean) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  buttonText: string;
  onFileChange?: (file: File | null) => void;
}

const SponsorFormDialog: React.FC<SponsorFormDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  formData,
  onInputChange,
  onSwitchChange,
  onSubmit,
  isSubmitting,
  buttonText,
  onFileChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoTab, setLogoTab] = useState<string>("url");
  const [previewUrl, setPreviewUrl] = useState<string | null>(formData.logo_url || null);
  const [logoFileName, setLogoFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setLogoFileName(file.name);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      if (onFileChange) {
        onFileChange(file);
      }
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreviewUrl(e.target.value);
    onInputChange(e);
  };

  const handleLogoTabChange = (value: string) => {
    setLogoTab(value);
    if (value === "url" && fileInputRef.current) {
      fileInputRef.current.value = "";
      setLogoFileName(null);
      if (onFileChange) {
        onFileChange(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              placeholder="Enter sponsor name"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Logo</Label>
            <Tabs value={logoTab} onValueChange={handleLogoTabChange}>
              <TabsList className="grid grid-cols-2 mb-2">
                <TabsTrigger value="url" className="flex items-center">
                  <Link className="h-4 w-4 mr-2" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="url" className="space-y-2">
                <Input
                  id="logo_url"
                  name="logo_url"
                  value={formData.logo_url}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/logo.png"
                />
              </TabsContent>
              
              <TabsContent value="upload" className="space-y-2">
                <div className="flex flex-col items-center border-2 border-dashed rounded-md p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {logoFileName ? logoFileName : "Click to upload a logo image"}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            
            {previewUrl && (
              <div className="mt-2 p-2 bg-background border rounded-md">
                <p className="text-xs text-muted-foreground mb-2">Logo Preview:</p>
                <div className="bg-white p-2 rounded-md flex items-center justify-center h-20">
                  <img
                    src={previewUrl}
                    alt="Logo preview"
                    className="max-h-16 max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      setPreviewUrl(null);
                    }}
                  />
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-500">For best results, use a square or horizontal logo with transparent background.</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website_url">Website URL</Label>
            <Input
              id="website_url"
              name="website_url"
              value={formData.website_url}
              onChange={onInputChange}
              placeholder="https://example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={onInputChange}
              placeholder="Enter a brief description"
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="is_active" 
              checked={formData.is_active} 
              onCheckedChange={onSwitchChange} 
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SponsorFormDialog;
