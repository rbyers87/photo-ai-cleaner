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
import { Filesystem, Directory } from '@capacitor/filesystem';
import { analyzePhoto, findDuplicates } from "@/utils/imageAnalysis";

export interface PhotoItem {
  id: string;
  file: File;
  preview: string;
  status: "analyzing" | "keep" | "delete";
  reasons: Array<"blurry" | "duplicate" | "screenshot" | "unknown">;
  nativeUri?: string; // Native file path for actual deletion
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

  const handlePhotosUploaded = async (files: File[]) => {
    const newPhotos: PhotoItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      status: "analyzing",
      reasons: [],
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);
    toast.success(`Analyzing ${files.length} photos with AI...`);

    // Find duplicates first
    const duplicateMap = await findDuplicates(files);
    
    // Analyze each photo with AI
    const analysisPromises = newPhotos.map(async (photo, index) => {
      // Add a small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, index * 500));
      
      try {
        const analysis = await analyzePhoto(photo.file);
        const reasons: Array<"blurry" | "duplicate" | "screenshot" | "unknown"> = [];
        
        // Check if it's a duplicate
        if (duplicateMap.has(index)) {
          reasons.push("duplicate");
        }
        
        // Check AI analysis results
        if (analysis.isScreenshot) {
          reasons.push("screenshot");
        }
        
        if (analysis.isBlurry && analysis.blurScore > 50) {
          reasons.push("blurry");
        }
        
        const shouldDelete = reasons.length > 0;
        
        return {
          id: photo.id,
          status: shouldDelete ? "delete" : "keep",
          reasons
        };
      } catch (error) {
        console.error(`Failed to analyze ${photo.file.name}:`, error);
        return {
          id: photo.id,
          status: "keep",
          reasons: []
        };
      }
    });

    // Update photos as analyses complete
    const results = await Promise.all(analysisPromises);
    
    setPhotos((prev) =>
      prev.map((p) => {
        const result = results.find((r) => r.id === p.id);
        if (result) {
          return { ...p, status: result.status as "analyzing" | "keep" | "delete", reasons: result.reasons };
        }
        return p;
      })
    );

    toast.success(`Analysis complete! Found ${results.filter(r => r.status === 'delete').length} photos to review.`);
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

  const handleBatchDelete = async () => {
    if (selectedPhotos.size === 0) {
      toast.error("No photos selected");
      return;
    }

    const photosToDelete = photos.filter((p) => selectedPhotos.has(p.id));
    let deletedCount = 0;
    let failedCount = 0;

    // Attempt to delete actual files from device if on native platform
    if (window.Capacitor?.isNativePlatform()) {
      for (const photo of photosToDelete) {
        if (photo.nativeUri) {
          try {
            await Filesystem.deleteFile({ path: photo.nativeUri });
            deletedCount++;
          } catch (error) {
            console.error(`Failed to delete ${photo.file.name}:`, error);
            failedCount++;
          }
        }
      }
    }

    // Remove from app state
    setPhotos((prev) => prev.filter((p) => !selectedPhotos.has(p.id)));
    
    if (window.Capacitor?.isNativePlatform()) {
      if (deletedCount > 0) {
        toast.success(`Deleted ${deletedCount} photo${deletedCount > 1 ? 's' : ''} from device`);
      }
      if (failedCount > 0) {
        toast.error(`Failed to delete ${failedCount} photo${failedCount > 1 ? 's' : ''}`);
      }
    } else {
      toast.success(`Removed ${selectedPhotos.size} photos from list`);
    }
    
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
