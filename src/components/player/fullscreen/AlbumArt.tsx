
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface AlbumArtProps {
  artwork: string;
}

const DEFAULT_ARTWORK = "/lovable-uploads/12fe363a-3bad-45f9-8212-66621f85b9ac.png";

export const AlbumArt = ({ artwork }: AlbumArtProps) => {
  return (
    <div className="flex-1 flex items-center justify-center overflow-visible mt-10">
      <div className="w-[85vw] aspect-square max-w-[400px] rounded-2xl overflow-hidden shadow-lg">
        <AspectRatio ratio={1/1}>
          <img
            src={artwork || DEFAULT_ARTWORK}
            alt="Album Art"
            className="object-contain w-full h-full"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_ARTWORK;
            }}
          />
        </AspectRatio>
      </div>
    </div>
  );
};
