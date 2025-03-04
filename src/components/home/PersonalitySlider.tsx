
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Facebook, Twitter, Instagram } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Personality {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  social_links: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  } | null;
}

const PersonalitySlider = () => {
  const { data: personalities, isLoading } = useQuery({
    queryKey: ["home-personalities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("personalities")
        .select("id, name, role, bio, image_url, social_links")
        .order("name");
      
      if (error) {
        console.error("Error fetching personalities:", error);
        return [];
      }
      
      return data as Personality[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Meet Our Team</h2>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!personalities || personalities.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Meet Our Team</h2>
        <Button variant="outline" asChild>
          <a href="/personalities">View All</a>
        </Button>
      </div>
      
      <div className="relative mx-12">
        <Carousel className="w-full">
          <CarouselContent>
            {personalities.map((personality) => (
              <CarouselItem key={personality.id} className="md:basis-1/3 lg:basis-1/4">
                <Card className="overflow-hidden h-full">
                  <div className="aspect-square overflow-hidden bg-muted">
                    {personality.image_url ? (
                      <img
                        src={personality.image_url}
                        alt={personality.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/150?text=No+Image";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-bold truncate">{personality.name}</h3>
                    <p className="text-sm text-muted-foreground">{personality.role}</p>
                    
                    {personality.bio && (
                      <p className="text-sm mt-2 line-clamp-2">{personality.bio}</p>
                    )}
                    
                    {personality.social_links && (
                      <div className="flex space-x-2 mt-3">
                        {personality.social_links.twitter && (
                          <a 
                            href={personality.social_links.twitter} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-blue-400"
                          >
                            <Twitter className="h-4 w-4" />
                          </a>
                        )}
                        {personality.social_links.instagram && (
                          <a 
                            href={personality.social_links.instagram} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-pink-500"
                          >
                            <Instagram className="h-4 w-4" />
                          </a>
                        )}
                        {personality.social_links.facebook && (
                          <a 
                            href={personality.social_links.facebook} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-blue-600"
                          >
                            <Facebook className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </Carousel>
      </div>
    </div>
  );
};

export default PersonalitySlider;
