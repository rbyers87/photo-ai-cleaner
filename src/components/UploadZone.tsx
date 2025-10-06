import { useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, FolderOpen, FileArchive } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Camera } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import JSZip from "jszip";
import { toast } from "sonner";

// Upload limits
const MAX_ZIP_SIZE_MB = 100;
const MAX_ZIP_SIZE_BYTES = MAX_ZIP_SIZE_MB * 1024 * 1024;
const MAX_PHOTO_SIZE_MB = 10;
const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;
const MAX_PHOTOS_COUNT = 200;

interface UploadZoneProps {
  onPhotosUploaded: (files: File[]) => void;
}

export const UploadZone = ({ onPhotosUploaded }: UploadZoneProps) => {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const imageFiles = acceptedFiles.filter((file) =>
        file.type.startsWith("image/")
      );
      
      if (imageFiles.length > MAX_PHOTOS_COUNT) {
        toast.error(`Maximum ${MAX_PHOTOS_COUNT} photos allowed at once`);
        return;
      }
      
      const oversizedFiles = imageFiles.filter(file => file.size > MAX_PHOTO_SIZE_BYTES);
      if (oversizedFiles.length > 0) {
        toast.error(`Some photos exceed ${MAX_PHOTO_SIZE_MB}MB limit`);
        return;
      }
      
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
      
      if (imageFiles.length > MAX_PHOTOS_COUNT) {
        toast.error(`Maximum ${MAX_PHOTOS_COUNT} photos allowed at once`);
        return;
      }
      
      const oversizedFiles = imageFiles.filter(file => file.size > MAX_PHOTO_SIZE_BYTES);
      if (oversizedFiles.length > 0) {
        toast.error(`Some photos exceed ${MAX_PHOTO_SIZE_MB}MB limit`);
        return;
      }
      
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
        limit: MAX_PHOTOS_COUNT,
      });

      const files = await Promise.all(
        images.photos.map(async (photo) => {
          const response = await fetch(photo.webPath);
          const blob = await response.blob();
          const fileName = photo.path?.split('/').pop() || `photo_${Date.now()}.jpg`;
          return new File([blob], fileName, { type: 'image/jpeg' });
        })
      );

      const oversizedFiles = files.filter(file => file.size > MAX_PHOTO_SIZE_BYTES);
      if (oversizedFiles.length > 0) {
        toast.error(`Some photos exceed ${MAX_PHOTO_SIZE_MB}MB limit`);
        return;
      }

      if (files.length > 0) {
        onPhotosUploaded(files);
      }
    } catch (error) {
      console.error('Error picking images:', error);
    }
  }, [onPhotosUploaded]);

  const handleZipUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > MAX_ZIP_SIZE_BYTES) {
        toast.error(`Zip file exceeds ${MAX_ZIP_SIZE_MB}MB limit`);
        e.target.value = '';
        return;
      }

      toast.loading(`Extracting photos from ${file.name}...`);

      try {
        const zip = new JSZip();
        const contents = await zip.loadAsync(file);
        
        const imageFiles: File[] = [];
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.bmp'];

        for (const [filename, zipEntry] of Object.entries(contents.files)) {
          if (zipEntry.dir) continue;
          
          const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
          if (imageExtensions.includes(ext)) {
            const blob = await zipEntry.async('blob');
            const imageFile = new File([blob], filename.split('/').pop() || filename, {
              type: `image/${ext.slice(1)}`
            });
            imageFiles.push(imageFile);
          }
        }

        toast.dismiss();
        
        if (imageFiles.length === 0) {
          toast.error('No images found in zip file');
          e.target.value = '';
          return;
        }
        
        if (imageFiles.length > MAX_PHOTOS_COUNT) {
          toast.error(`Zip contains ${imageFiles.length} photos. Maximum ${MAX_PHOTOS_COUNT} allowed`);
          e.target.value = '';
          return;
        }
        
        const oversizedFiles = imageFiles.filter(file => file.size > MAX_PHOTO_SIZE_BYTES);
        if (oversizedFiles.length > 0) {
          toast.error(`Some photos in zip exceed ${MAX_PHOTO_SIZE_MB}MB limit`);
          e.target.value = '';
          return;
        }
        
        onPhotosUploaded(imageFiles);
        toast.success(`Extracted ${imageFiles.length} photos from zip file`);
      } catch (error) {
        toast.dismiss();
        console.error('Error extracting zip:', error);
        toast.error('Failed to extract zip file');
      }

      // Reset input
      e.target.value = '';
    },
    [onPhotosUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".heic"],
      "application/zip": [".zip"],
      "application/x-zip-compressed": [".zip"],
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
            Drag and drop images or zip files, or use the buttons below. AI will analyze for
            blur, duplicates, and screenshots.
          </p>
          <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground mt-2">
            <span>Max {MAX_PHOTOS_COUNT} photos</span>
            <span>•</span>
            <span>{MAX_PHOTO_SIZE_MB}MB per photo</span>
            <span>•</span>
            <span>{MAX_ZIP_SIZE_MB}MB zip limit</span>
          </div>
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
          
          {!Capacitor.isNativePlatform() && (
            <>
              <input
                ref={zipInputRef}
                type="file"
                accept=".zip"
                onChange={handleZipUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => zipInputRef.current?.click()}
              >
                <FileArchive className="h-4 w-4 mr-2" />
                Upload Zip
              </Button>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
          <span className="px-3 py-1 rounded-full bg-muted">PNG</span>
          <span className="px-3 py-1 rounded-full bg-muted">JPG</span>
          <span className="px-3 py-1 rounded-full bg-muted">HEIC</span>
          <span className="px-3 py-1 rounded-full bg-muted">GIF</span>
          <span className="px-3 py-1 rounded-full bg-muted">WEBP</span>
          <span className="px-3 py-1 rounded-full bg-muted">ZIP</span>
        </div>
      </div>
    </div>
  );
};
