import '../types/capacitor';

interface AdBannerProps {
  show: boolean;
}

export const AdBanner = ({ show }: AdBannerProps) => {
  if (!show) return null;

  // On web, show a placeholder for development
  if (!window.Capacitor?.isNativePlatform()) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-[50px] bg-muted/80 backdrop-blur-sm border-t border-border flex items-center justify-center z-40">
        <p className="text-xs text-muted-foreground">Ad Banner (Test Mode)</p>
      </div>
    );
  }

  // On native, AdMob handles rendering
  return <div className="h-[50px]" />;
};
