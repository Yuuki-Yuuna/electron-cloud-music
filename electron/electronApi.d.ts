import { ipcRenderer } from 'electron'
import { DownloadMusic, ElectronListenFunction } from './preload'

export interface ElectronWindowApi {
  closeWindow: () => void
  minimizeWindow: () => void
  download: (name: string, url: string) => void
  cancelDownload: (music: DownloadMusic) => void
  // changeDownload: (music: DownloadMusic) => void
  openDownloadPath: () => void
  selectDownloadPath: () => void
  changeDownloadPath: (newPath: string) => void
  listenDownloadConfirm: (fn: ElectronListenFunction) => Electron.IpcRenderer
  listenDownloadUpdate: (fn: ElectronListenFunction) => Electron.IpcRenderer
  listenDownloadCompleted: (fn: ElectronListenFunction) => Electron.IpcRenderer
  listenDownloadFailed: (fn: ElectronListenFunction) => Electron.IpcRenderer
  listenDownloadPathChange: (fn: ElectronListenFunction) => Electron.IpcRenderer
}

declare global {
  interface Window {
    electronWindowApi: ElectronWindowApi
  }
}