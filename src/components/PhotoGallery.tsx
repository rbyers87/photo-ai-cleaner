import { PhotoCard } from "./PhotoCard";
import type { PhotoItem } from "@/pages/Index";

interface PhotoGalleryProps {
  photos: PhotoItem[];
  selectedPhotos: Set<string>;
  onPhotoSelect: (id: string) => void;
}

export const PhotoGallery = ({
  photos,
  selectedPhotos,
  onPhotoSelect,
}: PhotoGalleryProps) => {
  if (photos.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="mx-auto max-w-md space-y-3">
          <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <span className="text-2xl">📷</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground">No photos here</h3>
          <p className="text-sm text-muted-foreground">
            Upload some photos to get started, or switch to another category.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {photos.map((photo) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          isSelected={selectedPhotos.has(photo.id)}
          onSelect={() => onPhotoSelect(photo.id)}
        />
      ))}
    </div>
  );
};
