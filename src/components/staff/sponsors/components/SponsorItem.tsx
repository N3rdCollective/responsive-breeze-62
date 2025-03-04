
import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Trash2, ExternalLink, Image } from "lucide-react";
import { Sponsor } from "../types";

interface SponsorItemProps {
  sponsor: Sponsor;
  index: number;
  totalSponsors: number;
  onEdit: (sponsor: Sponsor) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, direction: "up" | "down") => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

const SponsorItem: React.FC<SponsorItemProps> = ({
  sponsor,
  index,
  totalSponsors,
  onEdit,
  onDelete,
  onReorder,
  onToggleActive
}) => {
  return (
    <div 
      className="flex items-center justify-between p-4 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
    >
      <div className="flex items-center space-x-4">
        <div className="bg-white rounded-md p-2 h-12 w-12 flex items-center justify-center">
          {sponsor.logo_url ? (
            <img 
              src={sponsor.logo_url} 
              alt={`${sponsor.name} logo`}
              className="max-h-10 max-w-full object-contain"
            />
          ) : (
            <Image className="h-6 w-6 text-gray-400" />
          )}
        </div>
        <div>
          <div className="flex items-center">
            <h3 className="font-semibold">{sponsor.name}</h3>
            {!sponsor.is_active && (
              <Badge variant="outline" className="ml-2 text-xs">Inactive</Badge>
            )}
          </div>
          {sponsor.website_url && (
            <a 
              href={sponsor.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline flex items-center"
            >
              {sponsor.website_url.replace(/^https?:\/\//, '').split('/')[0]}
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex flex-col space-y-1">
          <Button 
            variant="ghost" 
            size="sm"
            disabled={index === 0}
            onClick={() => onReorder(sponsor.id, "up")}
          >
            <ArrowUpDown className="h-4 w-4 rotate-90" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            disabled={index === totalSponsors - 1}
            onClick={() => onReorder(sponsor.id, "down")}
          >
            <ArrowUpDown className="h-4 w-4 rotate-270" />
          </Button>
        </div>
        <Switch 
          checked={sponsor.is_active}
          onCheckedChange={(checked) => onToggleActive(sponsor.id, checked)}
        />
        <Button variant="outline" size="sm" onClick={() => onEdit(sponsor)}>
          Edit
        </Button>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => {
            if (window.confirm(`Are you sure you want to delete ${sponsor.name}?`)) {
              onDelete(sponsor.id);
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SponsorItem;
