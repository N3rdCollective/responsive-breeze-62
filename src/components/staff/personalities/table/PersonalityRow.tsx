
import { format } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import PersonalityTableActions from "./PersonalityTableActions";

interface Personality {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  social_links: Record<string, string> | null;
  start_date: string | null;
  created_at: string;
}

interface PersonalityRowProps {
  personality: Personality;
  refetch: () => void;
}

const PersonalityRow = ({ personality, refetch }: PersonalityRowProps) => {
  return (
    <TableRow key={personality.id} className="hover:bg-muted/30">
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          {personality.image_url ? (
            <div className="h-10 w-10 rounded-full overflow-hidden">
              <img 
                src={personality.image_url} 
                alt={personality.name} 
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-medium">
                {personality.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span>{personality.name}</span>
        </div>
      </TableCell>
      <TableCell>
        {personality.role}
      </TableCell>
      <TableCell>
        {personality.start_date ? (
          <span className="text-sm">
            {format(new Date(personality.start_date), "MMM dd, yyyy")}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Not specified</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <PersonalityTableActions 
          personalityId={personality.id} 
          refetch={refetch} 
        />
      </TableCell>
    </TableRow>
  );
};

export default PersonalityRow;
