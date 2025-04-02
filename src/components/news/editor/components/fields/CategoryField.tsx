
import React from "react";
import { Label } from "@/components/ui/label";

const PREDEFINED_CATEGORIES = [
  "News",
  "Events",
  "Announcements",
  "Music",
  "Interviews",
  "Features",
  "Community",
  "Other"
];

interface CategoryFieldProps {
  category: string;
  setCategory: (category: string) => void;
}

const CategoryField: React.FC<CategoryFieldProps> = ({
  category,
  setCategory,
}) => {
  return (
    <div>
      <Label htmlFor="category">Category</Label>
      <select
        id="category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="" disabled>Select a category</option>
        {PREDEFINED_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
    </div>
  );
};

export default CategoryField;
