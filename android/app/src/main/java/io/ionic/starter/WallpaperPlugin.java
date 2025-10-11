package io.ionic.starter;

import android.Manifest;
import android.app.WallpaperManager;
import android.content.Context;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Build;
import android.util.Log;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@CapacitorPlugin(
  name = "Wallpaper",
  permissions = {
    @Permission(strings = {
      Manifest.permission.SET_WALLPAPER,
      Manifest.permission.READ_EXTERNAL_STORAGE
    }, alias = "wallpaper")
  }
)
public class WallpaperPlugin extends Plugin {

  private static final String TAG = "WallpaperPlugin";
  private static final String PERMISSION_DENIED = "Permission denied to set wallpaper";
  private static final String WALLPAPER_SET_ERROR = "Error setting wallpaper";
  private static final String INVALID_IMAGE_PATH = "Invalid image path";

  @PluginMethod
  public void setHomeScreenWallpaper(PluginCall call) {
    setWallpaperInternal(call, WallpaperManager.FLAG_SYSTEM, "home screen");
  }

  @PluginMethod
  public void setLockScreenWallpaper(PluginCall call) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
      call.reject("Lock screen wallpaper is only supported on Android 7.0 (API 24) and above");
      return;
    }
    setWallpaperInternal(call, WallpaperManager.FLAG_LOCK, "lock screen");
  }

  @PluginMethod
  public void setBothWallpaper(PluginCall call) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      setWallpaperInternal(call, WallpaperManager.FLAG_SYSTEM | WallpaperManager.FLAG_LOCK, "both screens");
    } else {
      setWallpaperInternal(call, -1, "both screens");
    }
  }

  private void setWallpaperInternal(PluginCall call, int flags, String screenType) {
    String imagePath = call.getString("imagePath");

    Log.d(TAG, "=== WALLPAPER DEBUG START ===");
    Log.d(TAG, "Setting wallpaper for: " + screenType);
    Log.d(TAG, "Image path received: " + imagePath);
    Log.d(TAG, "Android version: " + Build.VERSION.SDK_INT);

    if (imagePath == null || imagePath.isEmpty()) {
      Log.e(TAG, "Image path is null or empty");
      call.reject(INVALID_IMAGE_PATH);
      return;
    }

    boolean hasSetWallpaper = hasSetWallpaperPermission();
    boolean hasReadStorage = hasReadStoragePermission();

    Log.d(TAG, "SET_WALLPAPER permission: " + hasSetWallpaper);
    Log.d(TAG, "READ_STORAGE permission: " + hasReadStorage);

    if (!hasSetWallpaper) {
      Log.e(TAG, "Missing SET_WALLPAPER permission");
      call.reject(PERMISSION_DENIED + ". Missing SET_WALLPAPER permission.");
      return;
    }

    if (!hasReadStorage && (imagePath.startsWith("content://") || imagePath.startsWith("file://"))) {
      Log.e(TAG, "Missing READ_STORAGE permission for file access");
      call.reject(PERMISSION_DENIED + ". Missing READ_STORAGE permission for file access.");
      return;
    }

    try {
      Log.d(TAG, "Loading bitmap from path...");
      Bitmap bitmap = loadBitmapFromPath(imagePath);

      if (bitmap == null) {
        Log.e(TAG, "Failed to load bitmap - bitmap is null");
        call.reject("Failed to load image from path: " + imagePath + ". Check if the image exists and is accessible.");
        return;
      }

      Log.d(TAG, "Bitmap loaded successfully. Dimensions: " + bitmap.getWidth() + "x" + bitmap.getHeight());

      WallpaperManager wallpaperManager = WallpaperManager.getInstance(getContext());
      Log.d(TAG, "WallpaperManager obtained");

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && flags != -1) {
        Log.d(TAG, "Setting wallpaper with flags: " + flags);
        wallpaperManager.setBitmap(bitmap, null, true, flags);
      } else {
        Log.d(TAG, "Setting wallpaper with legacy method");
        wallpaperManager.setBitmap(bitmap);
      }

      JSObject ret = new JSObject();
      ret.put("success", true);
      ret.put("message", "Wallpaper set successfully for " + screenType);

      Log.d(TAG, "Wallpaper set successfully for " + screenType);
      Log.d(TAG, "=== WALLPAPER DEBUG END ===");

      call.resolve(ret);

    } catch (IOException e) {
      Log.e(TAG, "IOException setting wallpaper: " + e.getMessage());
      Log.e(TAG, "IOException details", e);
      call.reject(WALLPAPER_SET_ERROR + ": " + e.getMessage());
    } catch (SecurityException e) {
      Log.e(TAG, "SecurityException setting wallpaper: " + e.getMessage());
      Log.e(TAG, "SecurityException details", e);
      call.reject(PERMISSION_DENIED + ": " + e.getMessage());
    } catch (Exception e) {
      Log.e(TAG, "Unexpected error setting wallpaper: " + e.getMessage());
      Log.e(TAG, "Unexpected error details", e);
      call.reject("Unexpected error: " + e.getMessage());
    }
  }

  @PluginMethod
  public void checkPermissions(PluginCall call) {
    boolean hasSetWallpaper = hasSetWallpaperPermission();
    boolean hasReadStorage = hasReadStoragePermission();

    Log.d(TAG, "=== PERMISSION CHECK ===");
    Log.d(TAG, "SET_WALLPAPER: " + hasSetWallpaper);
    Log.d(TAG, "READ_STORAGE: " + hasReadStorage);
    Log.d(TAG, "Overall granted: " + (hasSetWallpaper && hasReadStorage));

    JSObject ret = new JSObject();
    ret.put("granted", hasSetWallpaper && hasReadStorage);
    ret.put("setWallpaper", hasSetWallpaper);
    ret.put("readStorage", hasReadStorage);

    call.resolve(ret);
  }

  @PluginMethod
  public void requestPermissions(PluginCall call) {
    if (hasAllWallpaperPermissions()) {
      Log.d(TAG, "All permissions already granted");
      JSObject ret = new JSObject();
      ret.put("granted", true);
      call.resolve(ret);
      return;
    }

    String[] permissions = getNeededPermissions();

    if (permissions.length > 0) {
      Log.d(TAG, "Requesting permissions: " + String.join(", ", permissions));
      ActivityCompat.requestPermissions(getActivity(), permissions, 1001);
      saveCall(call);
    } else {
      JSObject ret = new JSObject();
      ret.put("granted", true);
      call.resolve(ret);
    }
  }

  @Override
  protected void handleRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
    super.handleRequestPermissionsResult(requestCode, permissions, grantResults);

    Log.d(TAG, "Permission result received for request code: " + requestCode);

    PluginCall savedCall = getSavedCall();
    if (savedCall == null) {
      Log.w(TAG, "No saved call found for permission result");
      return;
    }

    boolean allGranted = true;
    for (int i = 0; i < permissions.length; i++) {
      boolean granted = grantResults[i] == PackageManager.PERMISSION_GRANTED;
      Log.d(TAG, "Permission " + permissions[i] + ": " + granted);
      if (!granted) {
        allGranted = false;
      }
    }

    JSObject ret = new JSObject();
    ret.put("granted", allGranted);
    Log.d(TAG, "All permissions granted: " + allGranted);
    savedCall.resolve(ret);
  }

  private boolean hasAllWallpaperPermissions() {
    return hasSetWallpaperPermission() && hasReadStoragePermission();
  }

  private boolean hasSetWallpaperPermission() {
    return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.SET_WALLPAPER)
      == PackageManager.PERMISSION_GRANTED;
  }

  private boolean hasReadStoragePermission() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      return ContextCompat.checkSelfPermission(getContext(), "android.permission.READ_MEDIA_IMAGES")
        == PackageManager.PERMISSION_GRANTED;
    } else {
      return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_EXTERNAL_STORAGE)
        == PackageManager.PERMISSION_GRANTED;
    }
  }

  private String[] getNeededPermissions() {
    java.util.List<String> permissions = new java.util.ArrayList<>();

    if (!hasSetWallpaperPermission()) {
      permissions.add(Manifest.permission.SET_WALLPAPER);
    }

    if (!hasReadStoragePermission()) {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        permissions.add("android.permission.READ_MEDIA_IMAGES");
      } else {
        permissions.add(Manifest.permission.READ_EXTERNAL_STORAGE);
      }
    }

    return permissions.toArray(new String[0]);
  }

  private Bitmap loadBitmapFromPath(String imagePath) {
    Log.d(TAG, "=== BITMAP LOADING DEBUG ===");
    Log.d(TAG, "Loading bitmap from path: " + imagePath);

    try {
      Context context = getContext();
      InputStream inputStream = null;

      if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        Log.d(TAG, "Loading from HTTP URL");
        URL url = new URL(imagePath);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setConnectTimeout(10000);
        connection.setReadTimeout(15000);
        connection.setDoInput(true);
        connection.connect();

        int responseCode = connection.getResponseCode();
        Log.d(TAG, "HTTP response code: " + responseCode);

        if (responseCode == HttpURLConnection.HTTP_OK) {
          inputStream = connection.getInputStream();
        } else {
          Log.e(TAG, "HTTP request failed with response code: " + responseCode);
          return null;
        }

      } else if (imagePath.startsWith("content://")) {
        Log.d(TAG, "Loading from content URI");
        Uri uri = Uri.parse(imagePath);
        inputStream = context.getContentResolver().openInputStream(uri);

      } else if (imagePath.startsWith("file://")) {
        Log.d(TAG, "Loading from file URI");
        Uri uri = Uri.parse(imagePath);
        inputStream = context.getContentResolver().openInputStream(uri);

      } else if (imagePath.startsWith("/")) {
        Log.d(TAG, "Loading from absolute path");
        return BitmapFactory.decodeFile(imagePath);

      } else {
        Log.d(TAG, "Loading from assets");
        inputStream = context.getAssets().open(imagePath);
      }

      if (inputStream != null) {
        Log.d(TAG, "Input stream obtained, decoding bitmap");
        Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
        inputStream.close();

        if (bitmap != null) {
          Log.d(TAG, "Bitmap loaded successfully. Size: " + bitmap.getWidth() + "x" + bitmap.getHeight() + ", Config: " + bitmap.getConfig());
        } else {
          Log.e(TAG, "Failed to decode bitmap from stream - bitmap is null");
        }

        return bitmap;
      } else {
        Log.e(TAG, "Failed to obtain input stream");
        return null;
      }

    } catch (FileNotFoundException e) {
      Log.e(TAG, "File not found: " + e.getMessage(), e);
    } catch (IOException e) {
      Log.e(TAG, "IO error loading bitmap: " + e.getMessage(), e);
    } catch (Exception e) {
      Log.e(TAG, "Unexpected error loading bitmap: " + e.getMessage(), e);
    }

    Log.e(TAG, "Failed to load bitmap from path: " + imagePath);
    return null;
  }
}
