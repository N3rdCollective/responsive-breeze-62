
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PersonalityManagementCard = () => {
  const navigate = useNavigate();

  const handleManagePersonalities = () => {
    navigate("/staff-personalities");
  };

  return (
    <Card className="bg-[#F5F5F5] dark:bg-[#333333] border-[#666666]/20 dark:border-white/10 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-black dark:text-[#FFD700]" />
        <h3 className="text-xl font-semibold text-black dark:text-[#FFD700]">
          Personalities
        </h3>
      </div>
      <p className="text-gray-500 dark:text-gray-400">
        Manage radio hosts, DJs, and other on-air personalities.
      </p>
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
          onClick={handleManagePersonalities}
        >
          Manage Personalities
        </Button>
      </div>
    </Card>
  );
};

export default PersonalityManagementCard;
