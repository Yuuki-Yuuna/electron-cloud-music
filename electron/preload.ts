import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronWindowApi', {
  closeWindow: () => ipcRenderer.send('window-close'),
  minimizeWindow: () => ipcRenderer.send('window-min'),
  download: (name: string, url: string) => ipcRenderer.send('download', name, url),
  cancelDownload: (music: DownloadMusic) => ipcRenderer.send('download-cancel', music),
  // changeDownload: (music: DownloadMusic) => ipcRenderer.send('download-change', music),
  openDownloadPath: () => ipcRenderer.send('download-open'),
  selectDownloadPath: () => ipcRenderer.send('download-path-select'),
  changeDownloadPath: (newPath: string) => ipcRenderer.send('download-path-change', newPath),
  listenDownloadConfirm: (fn: ElectronListenFunction) => ipcRenderer.on('download-confirm', fn),
  listenDownloadUpdate: (fn: ElectronListenFunction) => ipcRenderer.on('download-update', fn),
  listenDownloadCompleted: (fn: ElectronListenFunction) => ipcRenderer.on('download-completed', fn),
  listenDownloadFailed: (fn: ElectronListenFunction) => ipcRenderer.on('download-failed', fn),
  listenDownloadPathChange: (fn: ElectronListenFunction) => ipcRenderer.on('download-path-change', fn)
})

export type ElectronListenFunction = (event: Electron.Event, ...args: any[]) => void

export interface DownloadMusic {
  key: string//下载标识
  name: string,
  url: string,
  progress: number,
  isPaused: boolean,
  status: 'downloading' | 'success' | 'fail',
  size: number,
  receivedSize: number
}