import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  syncFörråd: () => ipcRenderer.invoke('sync-förråd'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  onSyncProgress: (callback: (progress: string) => void) => {
    ipcRenderer.on('sync-progress', (_event, progress) => callback(progress));
    return () => ipcRenderer.removeAllListeners('sync-progress');
  },
});

declare global {
  interface Window {
    electronAPI: {
      syncFörråd: () => Promise<{ success: boolean; output: string; error?: string }>;
      getAppVersion: () => Promise<string>;
      getPlatform: () => Promise<string>;
      onSyncProgress: (callback: (progress: string) => void) => () => void;
    };
  }
}