import { Camera } from "@capacitor/camera";
import { Filesystem } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";
import { App } from "@capacitor/app";

export async function ensurePermissions() {
  try {
    const platform = Capacitor.getPlatform();

    // --- Camera and Filesystem Permissions ---
    await Camera.requestPermissions();
    await Filesystem.requestPermissions();

    // --- Extra Android Handling ---
    if (platform === "android") {
      const info = await Device.getInfo();

      // MANAGE_EXTERNAL_STORAGE is needed for Android 11+
      if (info.osVersion && parseInt(info.osVersion) >= 11) {
        try {
          // Try deleting a file or reading to check access
          await Filesystem.readdir({ path: "", directory: "EXTERNAL" });
        } catch {
          console.warn("Storage permission not granted. Prompting user...");

          // Opens the app settings page so user can grant "All Files Access"
          await App.openUrl({
            url: "package:com.photoaicleaner.app",
          });
        }
      }
    }

    console.log("✅ All permissions granted!");
  } catch (err) {
    console.warn("Permission request failed:", err);
  }
}