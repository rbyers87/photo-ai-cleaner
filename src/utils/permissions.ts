import { PermissionsAndroid, Platform } from "react-native";
import { Camera } from "@capacitor/camera";
import { Filesystem } from "@capacitor/filesystem";

export async function ensurePermissions() {
  try {
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        PermissionsAndroid.PERMISSIONS.INTERNET,
      ]);
    }

    await Camera.requestPermissions();
    await Filesystem.requestPermissions();
  } catch (err) {
    console.warn("Permission request failed:", err);
  }
}
