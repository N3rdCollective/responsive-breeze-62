
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sponsor, SponsorFormData } from "../types";

export const useSponsorsData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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

  return {
    sponsors,
    isLoading,
    addSponsorMutation,
    updateSponsorMutation,
    deleteSponsorMutation,
    reorderSponsorsMutation,
    toggleActiveMutation
  };
};
