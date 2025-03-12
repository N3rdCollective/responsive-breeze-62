
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink } from "lucide-react";

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
}

const SponsorsSection = () => {
  const { data: sponsors, isLoading } = useQuery({
    queryKey: ["footer-sponsors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsors_affiliates")
        .select("id, name, logo_url, website_url, description")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      
      if (error) {
        console.error("Error fetching sponsors:", error);
        return [];
      }
      
      return data as Sponsor[];
    },
  });

  // Don't render the section if there are no sponsors or still loading
  if (!sponsors || sponsors.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 pt-6 border-t border-[#666666]/20 dark:border-white/10 text-center">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-[#FFD700]">Our Sponsors/Affiliates</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 justify-center max-w-4xl mx-auto">
        {sponsors.map((sponsor) => (
          <div key={sponsor.id} className="text-center">
            {sponsor.website_url ? (
              <a 
                href={sponsor.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:opacity-80 transition-opacity"
                title={sponsor.description || sponsor.name}
              >
                {sponsor.logo_url ? (
                  <div className="bg-white rounded-md p-2 h-16 flex items-center justify-center">
                    <img 
                      src={sponsor.logo_url} 
                      alt={`${sponsor.name} logo`}
                      className="max-h-12 max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="bg-white/10 rounded-md p-2 h-16 flex items-center justify-center text-sm">
                    <span className="mr-1">{sponsor.name}</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                )}
              </a>
            ) : (
              <div 
                className="bg-white/10 rounded-md p-2 h-16 flex items-center justify-center"
                title={sponsor.description || ""}
              >
                {sponsor.logo_url ? (
                  <img 
                    src={sponsor.logo_url} 
                    alt={`${sponsor.name} logo`}
                    className="max-h-12 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-sm">{sponsor.name}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SponsorsSection;
