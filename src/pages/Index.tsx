import { useState, useEffect } from "react";
import { UploadZone } from "@/components/UploadZone";
import { PhotoGallery } from "@/components/PhotoGallery";
import { Header } from "@/components/Header";
import { AdBanner } from "@/components/AdBanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Check, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAdRemoval } from "@/hooks/useAdRemoval";
import { useAds } from "@/hooks/useAds";

export interface PhotoItem {
  id: string;
  file: File;
  preview: string;
  status: "analyzing" | "keep" | "delete";
  reasons: Array<"blurry" | "duplicate" | "screenshot" | "unknown">;
}

const Index = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  
  const { adsRemoved, loading: adLoadingStatus } = useAdRemoval();
  const { showBanner, hideBanner, trackAction } = useAds(adsRemoved);

  // Show banner when component mounts and ads are not removed
  useEffect(() => {
    if (!adsRemoved) {
      showBanner();
    } else {
      hideBanner();
    }
  }, [adsRemoved]);

  const handlePhotosUploaded = (files: File[]) => {
    const newPhotos: PhotoItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      status: "analyzing",
      reasons: [],
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);
    
    // Simulate AI analysis
    newPhotos.forEach((photo, index) => {
      setTimeout(() => {
        setPhotos((prev) =>
          prev.map((p) => {
            if (p.id === photo.id) {
              // Check if file is a screenshot
              const fileName = p.file.name.toLowerCase();
              const isScreenshot = fileName.includes('screenshot') || 
                                   fileName.includes('screen_shot') ||
                                   fileName.includes('screen shot') ||
                                   fileName.startsWith('scr_') ||
                                   /screenshot[_-]?\d+/i.test(fileName);
              
              if (isScreenshot) {
                return { ...p, status: "delete", reasons: ["screenshot"] };
              }
              
              // Randomly assign other analysis results for demo
              const random = Math.random();
              if (random > 0.6) {
                return { ...p, status: "delete", reasons: ["blurry"] };
              } else if (random > 0.3) {
                return { ...p, status: "delete", reasons: ["duplicate"] };
              }
              return { ...p, status: "keep", reasons: [] };
            }
            return p;
          })
        );
      }, 1000 + index * 300);
    });

    toast.success(`Analyzing ${files.length} photos...`);
  };

  const handlePhotoSelect = (id: string) => {
    setSelectedPhotos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBatchDelete = () => {
    if (selectedPhotos.size === 0) {
      toast.error("No photos selected");
      return;
    }

    setPhotos((prev) => prev.filter((p) => !selectedPhotos.has(p.id)));
    toast.success(`Deleted ${selectedPhotos.size} photos`);
    setSelectedPhotos(new Set());
    
    // Track action for interstitial ad
    trackAction();
  };

  const handleKeepSelected = () => {
    if (selectedPhotos.size === 0) {
      toast.error("No photos selected");
      return;
    }

    setPhotos((prev) =>
      prev.map((p) => {
        if (selectedPhotos.has(p.id)) {
          return { ...p, status: "keep", reasons: [] };
        }
        return p;
      })
    );
    toast.success(`Marked ${selectedPhotos.size} photos to keep`);
    setSelectedPhotos(new Set());
    
    // Track action for interstitial ad
    trackAction();
  };

  const handleToggleSelectAllInCategory = (category: "delete" | "keep") => {
    const categoryPhotos = photos.filter((p) => p.status === category);
    const categoryIds = categoryPhotos.map((p) => p.id);
    
    // Check if all photos in this category are selected
    const allSelected = categoryIds.every((id) => selectedPhotos.has(id));
    
    if (allSelected) {
      // Deselect all in this category
      const newSelection = new Set(selectedPhotos);
      categoryIds.forEach((id) => newSelection.delete(id));
      setSelectedPhotos(newSelection);
      toast.success(`Deselected all photos`);
    } else {
      // Select all in this category
      const newSelection = new Set([...Array.from(selectedPhotos), ...categoryIds]);
      setSelectedPhotos(newSelection);
      toast.success(`Selected all ${categoryPhotos.length} photos`);
    }
  };

  const photosToDelete = photos.filter((p) => p.status === "delete");
  const photosToKeep = photos.filter((p) => p.status === "keep");
  
  const allDeletePhotosSelected = photosToDelete.length > 0 && 
    photosToDelete.every((p) => selectedPhotos.has(p.id));
  const allKeepPhotosSelected = photosToKeep.length > 0 && 
    photosToKeep.every((p) => selectedPhotos.has(p.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <UploadZone onPhotosUploaded={handlePhotosUploaded} />

        {photos.length > 0 && (
          <div className="space-y-6">
            <Tabs defaultValue="suggested" className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <TabsList className="grid w-full sm:w-auto grid-cols-2">
                  <TabsTrigger value="suggested" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Suggested Deletion ({photosToDelete.length})
                  </TabsTrigger>
                  <TabsTrigger value="keep" className="gap-2">
                    <Check className="h-4 w-4" />
                    Keep ({photosToKeep.length})
                  </TabsTrigger>
                </TabsList>

                {selectedPhotos.size > 0 && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      onClick={handleBatchDelete}
                      variant="destructive"
                      className="flex-1 sm:flex-none"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete ({selectedPhotos.size})
                    </Button>
                    <Button
                      onClick={handleKeepSelected}
                      variant="outline"
                      className="flex-1 sm:flex-none border-success text-success hover:bg-success hover:text-success-foreground"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Keep ({selectedPhotos.size})
                    </Button>
                  </div>
                )}
              </div>

              <TabsContent value="suggested" className="mt-0 space-y-4">
                {photosToDelete.length > 0 && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleSelectAllInCategory("delete")}
                    >
                      <CheckSquare className="h-4 w-4 mr-2" />
                      {allDeletePhotosSelected 
                        ? "Deselect All" 
                        : `Select All (${photosToDelete.length})`}
                    </Button>
                  </div>
                )}
                <PhotoGallery
                  photos={photosToDelete}
                  selectedPhotos={selectedPhotos}
                  onPhotoSelect={handlePhotoSelect}
                />
              </TabsContent>

              <TabsContent value="keep" className="mt-0 space-y-4">
                {photosToKeep.length > 0 && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleSelectAllInCategory("keep")}
                    >
                      <CheckSquare className="h-4 w-4 mr-2" />
                      {allKeepPhotosSelected 
                        ? "Deselect All" 
                        : `Select All (${photosToKeep.length})`}
                    </Button>
                  </div>
                )}
                <PhotoGallery
                  photos={photosToKeep}
                  selectedPhotos={selectedPhotos}
                  onPhotoSelect={handlePhotoSelect}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
      
      {/* Ad Banner at bottom */}
      <AdBanner show={!adsRemoved && !adLoadingStatus} />
    </div>
  );
};

export default Index;
