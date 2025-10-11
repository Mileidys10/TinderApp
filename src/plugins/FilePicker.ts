import { registerPlugin } from '@capacitor/core';

export interface FilePickerPlugin {

  pickImage(): Promise<{ 
    data: string;      
    mimeType: string;  
    name: string;      
    path: string;      
  }>;

 
  pickImages(options?: { limit?: number }): Promise<{
    files: Array<{
      data: string;
      mimeType: string;
      name: string;
      path: string;
    }>;
  }>;


  requestPermissions(): Promise<{ granted: boolean }>;


  checkPermissions(): Promise<{ granted: boolean }>;
}

const FilePicker = registerPlugin<FilePickerPlugin>('FilePicker', {
  web: () => import('./web/file-picker-web').then(m => new m.FilePickerWeb()),
});

export default FilePicker;