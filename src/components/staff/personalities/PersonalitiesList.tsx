
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, UserIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Personality {
  id: string;
  name: string;
  role: string;
  image_url?: string | null;
  bio?: string | null;
  start_date?: string | null;
}

interface PersonalitiesListProps {
  personalities: Personality[];
  loading: boolean;
  onEdit?: (personality: Personality) => void;
  onDelete?: (id: string) => void;
}

const PersonalitiesList = ({
  personalities,
  loading,
  onEdit,
  onDelete
}: PersonalitiesListProps) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading personalities...</p>
      </div>
    );
  }

  if (!personalities.length) {
    return (
      <div className="text-center py-12 border rounded-md bg-muted/20">
        <UserIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium">No personalities yet</h3>
        <p className="text-muted-foreground mb-4">
          Add personalities to showcase your radio talent
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Photo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {personalities.map((personality) => (
            <TableRow key={personality.id}>
              <TableCell>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={personality.image_url || ""} alt={personality.name} />
                  <AvatarFallback>
                    {personality.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{personality.name}</TableCell>
              <TableCell>{personality.role}</TableCell>
              <TableCell>
                {personality.start_date 
                  ? new Date(personality.start_date).toLocaleDateString() 
                  : "N/A"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {onEdit && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(personality)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950" 
                      onClick={() => onDelete(personality.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PersonalitiesList;
