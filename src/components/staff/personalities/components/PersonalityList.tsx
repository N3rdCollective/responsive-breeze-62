
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Personality } from "../types";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

interface PersonalityListProps {
  personalities: Personality[];
  loading: boolean;
  selectedPersonality: Personality | null;
  onSelectPersonality: (personality: Personality) => void;
  onReorder: (sourceIndex: number, destinationIndex: number) => void;
}

const PersonalityList = ({ 
  personalities, 
  loading, 
  selectedPersonality, 
  onSelectPersonality,
  onReorder
}: PersonalityListProps) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    onReorder(result.source.index, result.destination.index);
  };

  return (
    <div className="lg:col-span-1 bg-[#F5F5F5] dark:bg-[#333333] border-[#666666]/20 dark:border-white/10 p-6 rounded-md">
      <h3 className="text-lg font-semibold mb-4">Personalities</h3>
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#FFD700]" />
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="personalities">
            {(provided) => (
              <div 
                className="space-y-2"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {personalities.map((personality, index) => (
                  <Draggable 
                    key={personality.id}
                    draggableId={personality.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-3 rounded-md cursor-pointer ${
                          snapshot.isDragging ? 'bg-[#FFD700]/10 border border-[#FFD700]/50' : 
                          selectedPersonality?.id === personality.id ? 
                            'bg-[#FFD700]/20 border border-[#FFD700]' : 
                            'hover:bg-white/50 dark:hover:bg-[#444444]'
                        }`}
                        onClick={() => onSelectPersonality(personality)}
                      >
                        <div className="flex items-center">
                          <div className="flex-grow">
                            <p className="font-medium">{personality.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{personality.role}</p>
                          </div>
                          <div className="text-gray-400 dark:text-gray-600">
                            <span className="text-xs">{personality.display_order || index + 1}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {personalities.length === 0 && (
                  <p className="text-center py-4 text-gray-500 dark:text-gray-400">No personalities found</p>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default PersonalityList;
