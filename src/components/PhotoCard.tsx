import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle, Copy, UserX, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PhotoItem } from "@/pages/Index";

interface PhotoCardProps {
  photo: PhotoItem;
  isSelected: boolean;
  onSelect: () => void;
}

const reasonConfig = {
  blurry: {
    label: "Blurry",
    icon: AlertCircle,
    className: "bg-warning/10 text-warning border-warning/20",
  },
  duplicate: {
    label: "Duplicate",
    icon: Copy,
    className: "bg-accent/10 text-accent border-accent/20",
  },
  screenshot: {
    label: "Screenshot",
    icon: Monitor,
    className: "bg-primary/10 text-primary border-primary/20",
  },
  unknown: {
    label: "Unknown Person",
    icon: UserX,
    className: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
  },
};

export const PhotoCard = ({ photo, isSelected, onSelect }: PhotoCardProps) => {
  return (
    <div
      className={cn(
        "group relative rounded-xl overflow-hidden transition-all duration-300",
        "bg-card border border-border hover:border-primary/50",
        "hover:shadow-card hover:scale-[1.02]",
        isSelected && "ring-2 ring-primary shadow-elegant scale-[1.02]"
      )}
    >
      <div className="aspect-square relative overflow-hidden bg-muted">
        <img
          src={photo.preview}
          alt={photo.file.name}
          className="w-full h-full object-cover"
        />
        
        {photo.status === "analyzing" && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center space-y-2">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              <p className="text-xs text-muted-foreground">Analyzing...</p>
            </div>
          </div>
        )}

        <div className="absolute top-2 left-2 right-2 flex justify-between items-start gap-2">
          <div className="flex flex-wrap gap-1">
            {photo.reasons.map((reason) => {
              const config = reasonConfig[reason];
              const Icon = config.icon;
              return (
                <Badge
                  key={reason}
                  variant="outline"
                  className={cn("text-xs gap-1 backdrop-blur-sm", config.className)}
                >
                  <Icon className="h-3 w-3" />
                  {config.label}
                </Badge>
              );
            })}
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={cn(
              "rounded-md p-1 cursor-pointer transition-colors backdrop-blur-sm",
              "bg-background/80 border border-border",
              "hover:bg-background/90"
            )}
          >
            <Checkbox
              checked={isSelected}
              className="pointer-events-none data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>
        </div>
      </div>

      <div className="p-2">
        <p className="text-xs text-muted-foreground truncate" title={photo.file.name}>
          {photo.file.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {(photo.file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
    </div>
  );
};
