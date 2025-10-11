import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { NativeToast } from '../../core/providers/nativeToast/native-toast';
import { Translate } from '../../core/providers/translator/translate';
import { Wallpaper } from 'src/plugins/wallpaper';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { CapacitorHttp } from '@capacitor/core';

export enum WallpaperType {
  HOME_SCREEN = 'home',
  LOCK_SCREEN = 'lock',
  BOTH = 'both'
}

@Injectable({
  providedIn: 'root'
})
export class WallpaperService {

  constructor(
    private nativeToast: NativeToast,
    private translateSrv: Translate
  ) {}

  async setWallpaper(imagePath: string, type: WallpaperType): Promise<boolean> {
    try {
      console.log('Setting wallpaper with path:', imagePath, 'type:', type);

      const hasPermission = await this.checkPermissions();
      console.log('Has permission:', hasPermission);
      
      if (!hasPermission) {
        console.log('Requesting permissions...');
        const granted = await this.requestPermissions();
        console.log('Permission granted:', granted);
        
        if (!granted) {
          await this.nativeToast.show(
            this.translateSrv.instant('WALLPAPER.PERMISSION_DENIED') || 
            'Permiso denegado. Ve a Configuración > Aplicaciones > Tu App > Permisos y habilita los permisos necesarios.'
          );
          return false;
        }
      }

      let result;
      
      switch (type) {
        case WallpaperType.HOME_SCREEN:
          result = await Wallpaper.setHomeScreenWallpaper({ imagePath });
          break;
        case WallpaperType.LOCK_SCREEN:
          result = await Wallpaper.setLockScreenWallpaper({ imagePath });
          break;
        case WallpaperType.BOTH:
          result = await Wallpaper.setBothWallpaper({ imagePath });
          break;
        default:
          throw new Error('Tipo de wallpaper inválido');
      }

      if (result.success) {
        await this.nativeToast.show(
          result.message || 
          this.translateSrv.instant('WALLPAPER.SUCCESS') || 
          'Fondo de pantalla establecido correctamente'
        );
        return true;
      } else {
        await this.nativeToast.show(
          result.message || 
          this.translateSrv.instant('WALLPAPER.ERROR') || 
          'Error al establecer el fondo de pantalla'
        );
        return false;
      }

    } catch (error) {
      console.error('Error setting wallpaper:', error);
      await this.nativeToast.show(
        this.translateSrv.instant('WALLPAPER.UNEXPECTED_ERROR') || 
        'Ocurrió un error inesperado: ' + (error as any).message
      );
      return false;
    }
  }

  async setHomeScreenWallpaper(imagePath: string): Promise<boolean> {
    return this.setWallpaper(imagePath, WallpaperType.HOME_SCREEN);
  }

  async setLockScreenWallpaper(imagePath: string): Promise<boolean> {
    return this.setWallpaper(imagePath, WallpaperType.LOCK_SCREEN);
  }

  async setBothWallpaper(imagePath: string): Promise<boolean> {
    return this.setWallpaper(imagePath, WallpaperType.BOTH);
  }

  async checkPermissions(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) return false;
      
      const result = await Wallpaper.checkPermissions();
      console.log('Permission check result:', result);
      return result.granted;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) return false;
      
      const result = await Wallpaper.requestPermissions();
      console.log('Permission request result:', result);
      return result.granted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  async prepareImagePath(imageUrl: string): Promise<string> {
    try {
      console.log('Preparing image path for URL:', imageUrl);

      if (imageUrl.startsWith('file://') || imageUrl.startsWith('/')) {
        console.log('Image is already local:', imageUrl);
        return imageUrl;
      }

      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        console.log('Downloading image from URL...');
        return await this.downloadImageToLocal(imageUrl);
      }

      if (imageUrl.startsWith('content://')) {
        console.log('Using content URI directly:', imageUrl);
        return imageUrl;
      }

      console.log('Using image path directly:', imageUrl);
      return imageUrl;

    } catch (error) {
      console.error('Error preparing image path:', error);
      throw error;
    }
  }

  private async downloadImageToLocal(imageUrl: string): Promise<string> {
    try {
      console.log('Starting download of image:', imageUrl);

      const fileName = `wallpaper_${Date.now()}.jpg`;
      
      const response = await CapacitorHttp.get({
        url: imageUrl,
        responseType: 'blob'
      });

      console.log('Image downloaded, response status:', response.status);

      if (response.status !== 200) {
        throw new Error(`Error descargando imagen: ${response.status}`);
      }

      const blob = response.data;
      const base64Data = await this.blobToBase64(blob);
      
      const cleanBase64 = base64Data.split(',')[1];

      console.log('Image converted to base64, writing to file system...');

      const result = await Filesystem.writeFile({
        path: fileName,
        data: cleanBase64,
        directory: Directory.Cache
      });

      console.log('Image saved to:', result.uri);
      return result.uri;

    } catch (error) {
      console.error('Error downloading image to local:', error);
      
      console.log('Falling back to original URL');
      return imageUrl;
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async cleanupTempFiles(): Promise<void> {
    try {
      const files = await Filesystem.readdir({
        path: '',
        directory: Directory.Cache
      });

      const wallpaperFiles = files.files.filter(file => 
        file.name.startsWith('wallpaper_') && file.name.endsWith('.jpg')
      );

      for (const file of wallpaperFiles) {
        await Filesystem.deleteFile({
          path: file.name,
          directory: Directory.Cache
        });
      }

      console.log(`Cleaned up ${wallpaperFiles.length} temporary wallpaper files`);
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }

  getPlatformInfo(): string {
    const platform = Capacitor.getPlatform();
    return `Plataforma: ${platform}, Nativa: ${Capacitor.isNativePlatform()}`;
  }
}