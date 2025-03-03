
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface AlbumArtProps {
  artwork: string;
}

export const AlbumArt = ({ artwork }: AlbumArtProps) => {
  return (
    <div className="flex-1 flex items-center justify-center overflow-visible mt-10">
      <div className="w-[85vw] aspect-square max-w-[400px] rounded-2xl overflow-hidden shadow-lg">
        <AspectRatio ratio={1/1}>
          <img
            src={artwork}
            alt="Album Art"
            className="object-contain w-full h-full"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05";
            }}
          />
        </AspectRatio>
      </div>
    </div>
  );
};
