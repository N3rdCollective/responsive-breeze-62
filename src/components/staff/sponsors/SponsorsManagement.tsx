
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, ArrowUpDown, Plus, X, Check, ExternalLink, Image } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

interface SponsorFormData {
  name: string;
  logo_url: string;
  website_url: string;
  description: string;
  is_active: boolean;
}

const SponsorsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSponsor, setCurrentSponsor] = useState<Sponsor | null>(null);
  const [formData, setFormData] = useState<SponsorFormData>({
    name: "",
    logo_url: "",
    website_url: "",
    description: "",
    is_active: true
  });

  // Fetch sponsors
  const { data: sponsors, isLoading } = useQuery({
    queryKey: ["sponsors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsors_affiliates")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (error) {
        console.error("Error fetching sponsors:", error);
        toast({
          title: "Error",
          description: "Failed to load sponsors. Please try again.",
          variant: "destructive",
        });
        return [];
      }
      
      return data as Sponsor[];
    },
  });

  // Add sponsor mutation
  const addSponsorMutation = useMutation({
    mutationFn: async (sponsorData: Omit<SponsorFormData, "id">) => {
      const { data, error } = await supabase
        .from("sponsors_affiliates")
        .insert([sponsorData])
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sponsors"] });
      toast({
        title: "Success",
        description: "Sponsor added successfully.",
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Error adding sponsor:", error);
      toast({
        title: "Error",
        description: "Failed to add sponsor. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update sponsor mutation
  const updateSponsorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SponsorFormData> }) => {
      const { error } = await supabase
        .from("sponsors_affiliates")
        .update(data)
        .eq("id", id);

      if (error) throw error;
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sponsors"] });
      toast({
        title: "Success",
        description: "Sponsor updated successfully.",
      });
      setIsEditDialogOpen(false);
      setCurrentSponsor(null);
    },
    onError: (error) => {
      console.error("Error updating sponsor:", error);
      toast({
        title: "Error",
        description: "Failed to update sponsor. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete sponsor mutation
  const deleteSponsorMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("sponsors_affiliates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sponsors"] });
      toast({
        title: "Success",
        description: "Sponsor deleted successfully.",
      });
    },
    onError: (error) => {
      console.error("Error deleting sponsor:", error);
      toast({
        title: "Error",
        description: "Failed to delete sponsor. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reorder sponsors mutation
  const reorderSponsorsMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      if (!sponsors) return;
      
      const currentIndex = sponsors.findIndex(s => s.id === id);
      if (currentIndex === -1) return;
      
      const swapIndex = direction === "up" 
        ? Math.max(0, currentIndex - 1)
        : Math.min(sponsors.length - 1, currentIndex + 1);
        
      if (swapIndex === currentIndex) return;
      
      const currentSponsor = sponsors[currentIndex];
      const swapSponsor = sponsors[swapIndex];
      
      const updates = [
        { id: currentSponsor.id, display_order: swapSponsor.display_order },
        { id: swapSponsor.id, display_order: currentSponsor.display_order }
      ];
      
      // Update both sponsors
      for (const update of updates) {
        const { error } = await supabase
          .from("sponsors_affiliates")
          .update({ display_order: update.display_order })
          .eq("id", update.id);
        
        if (error) throw error;
      }
      
      return updates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sponsors"] });
    },
    onError: (error) => {
      console.error("Error reordering sponsors:", error);
      toast({
        title: "Error",
        description: "Failed to reorder sponsors. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Toggle sponsor active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("sponsors_affiliates")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
      return { id, isActive };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sponsors"] });
      toast({
        title: "Success",
        description: `Sponsor ${data.isActive ? "activated" : "deactivated"} successfully.`,
      });
    },
    onError: (error) => {
      console.error("Error toggling sponsor status:", error);
      toast({
        title: "Error",
        description: "Failed to update sponsor status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }));
  };

  const handleAddSponsor = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Sponsor name is required.",
        variant: "destructive",
      });
      return;
    }

    const newSponsor = {
      name: formData.name.trim(),
      logo_url: formData.logo_url.trim() || null,
      website_url: formData.website_url.trim() || null,
      description: formData.description.trim() || null,
      is_active: formData.is_active,
      display_order: sponsors ? sponsors.length : 0,
    };

    addSponsorMutation.mutate(newSponsor);
  };

  const handleEditSponsor = () => {
    if (!currentSponsor) return;
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Sponsor name is required.",
        variant: "destructive",
      });
      return;
    }

    const updatedSponsor = {
      name: formData.name.trim(),
      logo_url: formData.logo_url.trim() || null,
      website_url: formData.website_url.trim() || null,
      description: formData.description.trim() || null,
      is_active: formData.is_active,
    };

    updateSponsorMutation.mutate({ id: currentSponsor.id, data: updatedSponsor });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      logo_url: "",
      website_url: "",
      description: "",
      is_active: true,
    });
  };

  const handleOpenEditDialog = (sponsor: Sponsor) => {
    setCurrentSponsor(sponsor);
    setFormData({
      name: sponsor.name,
      logo_url: sponsor.logo_url || "",
      website_url: sponsor.website_url || "",
      description: sponsor.description || "",
      is_active: sponsor.is_active,
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sponsors & Affiliates Management</h2>
        <Button onClick={() => {
          resetForm();
          setIsAddDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add New Sponsor
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Sponsors & Affiliates</CardTitle>
        </CardHeader>
        <CardContent>
          {sponsors && sponsors.length > 0 ? (
            <div className="space-y-4">
              {sponsors.map((sponsor) => (
                <div 
                  key={sponsor.id} 
                  className="flex items-center justify-between p-4 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-white rounded-md p-2 h-12 w-12 flex items-center justify-center">
                      {sponsor.logo_url ? (
                        <img 
                          src={sponsor.logo_url} 
                          alt={`${sponsor.name} logo`}
                          className="max-h-10 max-w-full object-contain"
                        />
                      ) : (
                        <Image className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-semibold">{sponsor.name}</h3>
                        {!sponsor.is_active && (
                          <Badge variant="outline" className="ml-2 text-xs">Inactive</Badge>
                        )}
                      </div>
                      {sponsor.website_url && (
                        <a 
                          href={sponsor.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline flex items-center"
                        >
                          {sponsor.website_url.replace(/^https?:\/\//, '').split('/')[0]}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col space-y-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        disabled={sponsors.indexOf(sponsor) === 0}
                        onClick={() => reorderSponsorsMutation.mutate({ id: sponsor.id, direction: "up" })}
                      >
                        <ArrowUpDown className="h-4 w-4 rotate-90" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        disabled={sponsors.indexOf(sponsor) === sponsors.length - 1}
                        onClick={() => reorderSponsorsMutation.mutate({ id: sponsor.id, direction: "down" })}
                      >
                        <ArrowUpDown className="h-4 w-4 rotate-270" />
                      </Button>
                    </div>
                    <Switch 
                      checked={sponsor.is_active}
                      onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: sponsor.id, isActive: checked })}
                    />
                    <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(sponsor)}>
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${sponsor.name}?`)) {
                          deleteSponsorMutation.mutate(sponsor.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No sponsors or affiliates have been added yet.</p>
              <p className="mt-2">Click the "Add New Sponsor" button to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Sponsor Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Sponsor</DialogTitle>
            <DialogDescription>
              Enter the details for the new sponsor or affiliate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter sponsor name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleInputChange}
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-gray-500">For best results, use a square or horizontal logo with transparent background.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                name="website_url"
                value={formData.website_url}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter a brief description"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="is_active" 
                checked={formData.is_active} 
                onCheckedChange={handleSwitchChange} 
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button onClick={handleAddSponsor} disabled={addSponsorMutation.isPending}>
              {addSponsorMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Add Sponsor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Sponsor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Sponsor</DialogTitle>
            <DialogDescription>
              Update the details for this sponsor or affiliate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter sponsor name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-logo_url">Logo URL</Label>
              <Input
                id="edit-logo_url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleInputChange}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-website_url">Website URL</Label>
              <Input
                id="edit-website_url"
                name="website_url"
                value={formData.website_url}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter a brief description"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="edit-is_active" 
                checked={formData.is_active} 
                onCheckedChange={handleSwitchChange} 
              />
              <Label htmlFor="edit-is_active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button onClick={handleEditSponsor} disabled={updateSponsorMutation.isPending}>
              {updateSponsorMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SponsorsManagement;
