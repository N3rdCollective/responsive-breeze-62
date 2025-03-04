
import React from "react";
import { Loader2 } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import SponsorItem from "./SponsorItem";
import { Sponsor } from "../types";

interface SponsorsListProps {
  sponsors: Sponsor[] | undefined;
  isLoading: boolean;
  onEdit: (sponsor: Sponsor) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, direction: "up" | "down") => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

const SponsorsList: React.FC<SponsorsListProps> = ({
  sponsors,
  isLoading,
  onEdit,
  onDelete,
  onReorder,
  onToggleActive
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!sponsors || sponsors.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No sponsors or affiliates have been added yet.</p>
        <p className="mt-2">Click the "Add New Sponsor" button to get started.</p>
      </div>
    );
  }

  return (
    <CardContent>
      <div className="space-y-4">
        {sponsors.map((sponsor, index) => (
          <SponsorItem
            key={sponsor.id}
            sponsor={sponsor}
            index={index}
            totalSponsors={sponsors.length}
            onEdit={onEdit}
            onDelete={onDelete}
            onReorder={onReorder}
            onToggleActive={onToggleActive}
          />
        ))}
      </div>
    </CardContent>
  );
};

export default SponsorsList;
