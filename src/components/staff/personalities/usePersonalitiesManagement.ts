
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Personality, PaginationMeta } from "./types/personalitiesTypes";

export const usePersonalitiesManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Number of personalities per page
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["staff-personalities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("personalities")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) {
        toast({
          title: "Error fetching personalities",
          description: error.message,
          variant: "destructive",
        });
        return { personalities: [], pagination: { currentPage: 1, totalPages: 1, pageSize, totalItems: 0 } };
      }
      
      return { 
        personalities: data as Personality[],
        pagination: { 
          currentPage: 1, 
          totalPages: Math.ceil(data.length / pageSize),
          pageSize,
          totalItems: data.length
        } 
      };
    },
  });

  const personalities = data?.personalities || [];
  
  // Filter personalities based on search term
  const filteredPersonalities = personalities.filter(personality => {
    const matchesSearch = 
      personality.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      personality.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Calculate pagination metadata based on filtered personalities
  const paginationMeta: PaginationMeta = {
    currentPage,
    totalPages: Math.ceil(filteredPersonalities.length / pageSize),
    pageSize,
    totalItems: filteredPersonalities.length
  };

  // Get paginated personalities for current page
  const paginatedPersonalities = filteredPersonalities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    personalities,
    filteredPersonalities,
    paginatedPersonalities,
    pagination: paginationMeta,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    currentPage,
    handlePageChange
  };
};
