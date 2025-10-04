import { useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Camera } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";

interface UploadZoneProps {
  onPhotosUploaded: (files: File[]) => void;
}

export const UploadZone = ({ onPhotosUploaded }: UploadZoneProps) => {
  const folderInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const imageFiles = acceptedFiles.filter((file) =>
        file.type.startsWith("image/")
      );
      if (imageFiles.length > 0) {
        onPhotosUploaded(imageFiles);
      }
    },
    [onPhotosUploaded]
  );

  const handleFolderSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const imageFiles = files.filter((file) =>
        file.type.startsWith("image/")
      );
      if (imageFiles.length > 0) {
        onPhotosUploaded(imageFiles);
      }
    },
    [onPhotosUploaded]
  );

  const handleNativeGalleryPick = useCallback(async () => {
    try {
      const images = await Camera.pickImages({
        quality: 100,
        limit: 0, // No limit
      });

      const files = await Promise.all(
        images.photos.map(async (photo) => {
          const response = await fetch(photo.webPath);
          const blob = await response.blob();
          const fileName = photo.path?.split('/').pop() || `photo_${Date.now()}.jpg`;
          return new File([blob], fileName, { type: 'image/jpeg' });
        })
      );

      if (files.length > 0) {
        onPhotosUploaded(files);
      }
    } catch (error) {
      console.error('Error picking images:', error);
    }
  }, [onPhotosUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".heic"],
    },
    multiple: true,
    noClick: true,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300",
        "bg-gradient-to-br from-card to-muted/20 backdrop-blur-sm",
        "hover:shadow-elegant hover:scale-[1.01]",
        isDragActive
          ? "border-primary bg-primary/5 shadow-elegant scale-[1.01]"
          : "border-border"
      )}
    >
      <div className="py-16 px-8 text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-elegant">
          {isDragActive ? (
            <ImageIcon className="h-8 w-8 text-primary-foreground animate-pulse" />
          ) : (
            <Upload className="h-8 w-8 text-primary-foreground" />
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">
            {isDragActive ? "Drop your photos here" : "Upload your photos"}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Drag and drop your images, or select files and folders below. We'll analyze them for
            blur, duplicates, and unknown faces.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto">
          <label htmlFor="file-upload">
            <Button
              type="button"
              variant="default"
              className="w-full sm:w-auto cursor-pointer"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Select Files
            </Button>
          </label>
          <input
            id="file-upload"
            {...getInputProps()}
            className="hidden"
          />
          
          {!Capacitor.isNativePlatform() && (
            <>
              <input
                ref={folderInputRef}
                type="file"
                {...({ webkitdirectory: "", directory: "" } as any)}
                multiple
                onChange={handleFolderSelect}
                className="hidden"
                accept="image/*"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => folderInputRef.current?.click()}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Select Folder
              </Button>
            </>
          )}
          
          {Capacitor.isNativePlatform() && (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleNativeGalleryPick}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Select Photos
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
          <span className="px-3 py-1 rounded-full bg-muted">PNG</span>
          <span className="px-3 py-1 rounded-full bg-muted">JPG</span>
          <span className="px-3 py-1 rounded-full bg-muted">HEIC</span>
          <span className="px-3 py-1 rounded-full bg-muted">GIF</span>
          <span className="px-3 py-1 rounded-full bg-muted">WEBP</span>
        </div>
      </div>
    </div>
  );
};
