
import React from "react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface SponsorsHeaderProps {
  onAddClick: () => void;
}

const SponsorsHeader: React.FC<SponsorsHeaderProps> = ({ onAddClick }) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Sponsors & Affiliates</CardTitle>
      <Button 
        onClick={onAddClick}
        className="ml-auto"
      >
        <Plus className="h-4 w-4 mr-2" /> Add Sponsor
      </Button>
    </CardHeader>
  );
};

export default SponsorsHeader;
