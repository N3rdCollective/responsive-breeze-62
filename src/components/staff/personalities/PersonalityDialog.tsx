
import React, { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { usePersonalitiesData } from "./usePersonalitiesData";

interface Personality {
  id: string;
  name: string;
  role: string;
  image_url?: string | null;
  bio?: string | null;
  start_date?: string | null;
}

interface PersonalityDialogProps {
  open: boolean;
  onOpenChange: (refresh: boolean) => void;
  personality: Personality | null;
}

const PersonalityDialog = ({ 
  open, 
  onOpenChange, 
  personality 
}: PersonalityDialogProps) => {
  const { toast } = useToast();
  const { savePersonality } = usePersonalitiesData();
  const [name, setName] = useState("");
  const [role, setRole] = useState("Host");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (personality) {
      setName(personality.name || "");
      setRole(personality.role || "Host");
      setBio(personality.bio || "");
      setImageUrl(personality.image_url || "");
      setDate(personality.start_date ? new Date(personality.start_date) : undefined);
    } else {
      // Reset form for new personality
      setName("");
      setRole("Host");
      setBio("");
      setImageUrl("");
      setDate(undefined);
    }
  }, [personality, open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      await savePersonality({
        id: personality?.id,
        name,
        role,
        bio,
        image_url: imageUrl,
        start_date: date ? date.toISOString().split('T')[0] : null,
      });
      
      toast({
        title: "Success",
        description: `Personality ${personality ? "updated" : "created"} successfully`,
      });
      
      onOpenChange(true);
    } catch (error) {
      console.error("Error saving personality:", error);
      toast({
        title: "Error",
        description: `Failed to ${personality ? "update" : "create"} personality`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(false)}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {personality ? "Edit" : "Add"} Personality
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="DJ Smith"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Host, DJ, etc."
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief biography..."
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : personality ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalityDialog;
