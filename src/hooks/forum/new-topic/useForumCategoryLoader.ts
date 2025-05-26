
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ForumCategory } from "@/types/forum";

export const useForumCategoryLoader = (categorySlug: string | undefined) => {
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategory = async () => {
      if (!categorySlug) {
        setLoadingCategory(false);
        navigate('/members/forum'); // Or some other appropriate default
        toast({
          title: "Category slug missing",
          description: "Cannot load category without a slug.",
          variant: "destructive"
        });
        return;
      }
      
      try {
        setLoadingCategory(true);
        const { data, error } = await supabase
          .from('forum_categories')
          .select('*')
          .eq('slug', categorySlug)
          .single();
          
        if (error) throw error;
        
        if (!data) {
          setCategory(null);
          navigate('/members/forum');
          toast({
            title: "Category not found",
            description: "The forum category you're looking for doesn't exist.",
            variant: "destructive"
          });
          return;
        }
        
        setCategory(data);
      } catch (error: any) {
        console.error('Error fetching category:', error.message);
        setCategory(null);
        toast({
          title: "Error loading category",
          description: "We couldn't load the category data. Please try again.",
          variant: "destructive"
        });
        navigate('/members/forum');
      } finally {
        setLoadingCategory(false);
      }
    };
    
    fetchCategory();
  }, [categorySlug, navigate]);

  return { category, loadingCategory };
};
