
import { useState } from "react";
import { Loader2, Star } from "lucide-react";
import { Personality } from "../types";

interface PersonalityListProps {
  personalities: Personality[];
  loading: boolean;
  selectedPersonality: Personality | null;
  onSelectPersonality: (personality: Personality) => void;
}

const PersonalityList = ({ 
  personalities, 
  loading, 
  selectedPersonality, 
  onSelectPersonality 
}: PersonalityListProps) => {
  // Sort personalities with featured ones first, then by display_order or name
  const sortedPersonalities = [...personalities].sort((a, b) => {
    // First sort by featured status
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    
    // Then sort by display_order if available
    if (a.display_order !== undefined && b.display_order !== undefined) {
      return a.display_order - b.display_order;
    }
    
    // Finally sort by name
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="lg:col-span-1 bg-[#F5F5F5] dark:bg-[#333333] border-[#666666]/20 dark:border-white/10 p-6 rounded-md">
      <h3 className="text-lg font-semibold mb-4">Personalities</h3>
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#FFD700]" />
        </div>
      ) : (
        <div className="space-y-2">
          {sortedPersonalities.map(personality => (
            <div 
              key={personality.id}
              className={`p-3 rounded-md cursor-pointer ${selectedPersonality?.id === personality.id ? 
                'bg-[#FFD700]/20 border border-[#FFD700]' : 
                'hover:bg-white/50 dark:hover:bg-[#444444]'}`}
              onClick={() => onSelectPersonality(personality)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{personality.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{personality.role}</p>
                </div>
                {personality.featured && (
                  <Star className="h-4 w-4 text-[#FFD700] fill-[#FFD700]" />
                )}
              </div>
            </div>
          ))}
          {personalities.length === 0 && (
            <p className="text-center py-4 text-gray-500 dark:text-gray-400">No personalities found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalityList;
