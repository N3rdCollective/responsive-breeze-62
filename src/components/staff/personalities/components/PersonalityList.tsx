
import { useState } from "react";
import { Loader2 } from "lucide-react";
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
  return (
    <div className="lg:col-span-1 bg-[#F5F5F5] dark:bg-[#333333] border-[#666666]/20 dark:border-white/10 p-6 rounded-md">
      <h3 className="text-lg font-semibold mb-4">Personalities</h3>
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#FFD700]" />
        </div>
      ) : (
        <div className="space-y-2">
          {personalities.map(personality => (
            <div 
              key={personality.id}
              className={`p-3 rounded-md cursor-pointer ${selectedPersonality?.id === personality.id ? 
                'bg-[#FFD700]/20 border border-[#FFD700]' : 
                'hover:bg-white/50 dark:hover:bg-[#444444]'}`}
              onClick={() => onSelectPersonality(personality)}
            >
              <p className="font-medium">{personality.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{personality.role}</p>
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
