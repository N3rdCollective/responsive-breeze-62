
import { Button } from "@/components/ui/button";

interface GenreSelectorProps {
  selectedGenres: string[];
  onToggleGenre: (genre: string) => void;
  genres: string[];
  disabled?: boolean;
}

const GenreSelector = ({ selectedGenres, onToggleGenre, genres, disabled }: GenreSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {genres.map((genre) => (
        <Button
          key={genre}
          type="button"
          variant={selectedGenres.includes(genre) ? "default" : "outline"}
          size="sm"
          onClick={() => onToggleGenre(genre)}
          disabled={disabled}
        >
          {genre}
        </Button>
      ))}
    </div>
  );
};

export default GenreSelector;
