import { ArrowLeft, Crown, Sparkles, ShieldCheck, Image, Eye, Copy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useAdRemoval } from "@/hooks/useAdRemoval";
import { useScanPreferences } from "@/hooks/useScanPreferences";

const Settings = () => {
  const navigate = useNavigate();
  const { adsRemoved, purchasing, purchaseAdRemoval, restorePurchases } = useAdRemoval();
  const { preferences, updatePreferences, loading: preferencesLoading } = useScanPreferences();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your preferences</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* AI Scan Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                AI Scan Settings
              </CardTitle>
              <CardDescription>
                Control what types of photos the AI will suggest for deletion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm font-medium">Blurry Photos</label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Detect and suggest removal of out-of-focus images
                  </p>
                </div>
                <Switch
                  checked={preferences.scanBlurry}
                  onCheckedChange={(checked) => updatePreferences({ scanBlurry: checked })}
                  disabled={preferencesLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm font-medium">Screenshots</label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Detect and suggest removal of screenshot images
                  </p>
                </div>
                <Switch
                  checked={preferences.scanScreenshots}
                  onCheckedChange={(checked) => updatePreferences({ scanScreenshots: checked })}
                  disabled={preferencesLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Copy className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm font-medium">Duplicate Photos</label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Detect and suggest removal of similar or duplicate images
                  </p>
                </div>
                <Switch
                  checked={preferences.scanDuplicates}
                  onCheckedChange={(checked) => updatePreferences({ scanDuplicates: checked })}
                  disabled={preferencesLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm font-medium">Photos Without People</label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Detect and suggest removal of photos without any people in them
                  </p>
                </div>
                <Switch
                  checked={preferences.scanNoPeople}
                  onCheckedChange={(checked) => updatePreferences({ scanNoPeople: checked })}
                  disabled={preferencesLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Ad Removal Card */}
          <Card className="border-2 border-primary/20 shadow-elegant overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-[100%]" />
            
            <CardHeader className="relative">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center flex-shrink-0">
                  <Crown className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">Remove Ads</CardTitle>
                  <CardDescription className="text-base">
                    Pay once to enjoy an ad-free experience forever.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {adsRemoved ? (
                <div className="p-6 rounded-xl bg-success/10 border border-success/20">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck className="h-6 w-6 text-success" />
                    <h3 className="font-semibold text-success text-lg">Ad-Free Active</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You're enjoying an ad-free experience. Thank you for your support!
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium text-foreground">No Interruptions</h4>
                        <p className="text-sm text-muted-foreground">
                          Focus on cleaning your photos without banner or full-screen ads
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium text-foreground">One-Time Payment</h4>
                        <p className="text-sm text-muted-foreground">
                          Pay once and own it forever, no subscriptions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium text-foreground">Synced Across Devices</h4>
                        <p className="text-sm text-muted-foreground">
                          Purchase works on all your devices with the same account
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button
                      onClick={purchaseAdRemoval}
                      disabled={purchasing}
                      className="w-full h-12 text-base font-semibold"
                      size="lg"
                    >
                      {purchasing ? (
                        "Processing..."
                      ) : (
                        <>
                          <Crown className="h-5 w-5 mr-2" />
                          Unlock Ad-Free - $2.99
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={restorePurchases}
                      variant="ghost"
                      className="w-full"
                      disabled={purchasing}
                    >
                      Restore Purchases
                    </Button>
                  </div>
                </>
              )}

              <p className="text-xs text-muted-foreground text-center pt-2">
                {window.Capacitor?.isNativePlatform()
                  ? "Payments are processed securely through your app store"
                  : "Test mode active - Purchase will simulate on web"}
              </p>
            </CardContent>
          </Card>

          {/* App Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Build</span>
                <span className="font-medium">100</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
