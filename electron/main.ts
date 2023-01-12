import { app, BrowserWindow, dialog, DownloadItem, globalShortcut, ipcMain, shell } from 'electron'
import path from 'path'
import fs from 'fs'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'//关闭不安全警告
const distUrl = path.resolve(__dirname, '../dist')
const publicUrl = process.env.VITE_DEV_SERVER_URL ? path.resolve(__dirname, '../public') : distUrl
const preloadUrl = path.resolve(__dirname, 'preload.js')
const htmlUrl = path.resolve(distUrl, 'index.html')

app.disableHardwareAcceleration()// 禁用当前应用程序的硬件加速

const downloadMap = new Map<string, { music: DownloadMusic, downloadItem: DownloadItem | null }>()//下载队列(下载url是标识)
let defaultSavePath = 'D:/Repressive-Music'//默认下载路径

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1024,
    height: 680,
    icon: path.resolve(publicUrl, 'favicon.ico'),
    frame: false,
    resizable: false,
    fullscreenable: false,//禁用全屏
    webPreferences: {
      preload: preloadUrl
    }
  })
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    globalShortcut.register('F10', () => win.webContents.openDevTools())
  } else {
    win.loadFile(htmlUrl)
  }

  ipcMain.on('window-close', () => {
    win.close()
  })
  ipcMain.on('window-min', () => {
    win.minimize()
  })
  ipcMain.on('download', (event, name, url) => {
    if (downloadMap.has(url)) {
      win.webContents.send('download-confirm', null)
      return
    }
    const downloadMusic: DownloadMusic = {
      key: name + Date.now(),//下载标识
      name,
      url,
      progress: 0,
      isPaused: false,
      status: 'downloading',
      size: 0,
      receivedSize: 0
    }
    downloadMap.set(url, { music: downloadMusic, downloadItem: null })//加入队列
    win.webContents.downloadURL(url)
  })
  ipcMain.on('download-cancel', (event, music: DownloadMusic) => {
    const { downloadItem } = downloadMap.get(music.url)!
    downloadItem?.cancel()
  })
  // ipcMain.on('download-change', (event, music: DownloadMusic) => {
  //   const { downloadItem } = downloadMap.get(music.url)!
  //   console.log('status change')
  //   if(downloadItem) {
  //     if(downloadItem.isPaused()) {
  //       downloadItem.canResume() ? downloadItem.resume() : null//它返回个false，人麻了      
  //     } else {
  //       downloadItem.pause()
  //     }
  //   }
  // })
  ipcMain.on('download-open', () => {
    if(fs.existsSync(defaultSavePath)) {
      shell.openPath(path.normalize(defaultSavePath))//这个windows的反斜杠真恶臭
    }
  })
  ipcMain.on('download-path-select', () => {
    const selectedPath = dialog.showOpenDialogSync(win, {
      title: '选择保存位置',
      defaultPath: path.normalize(defaultSavePath),
      properties: ['openDirectory', 'createDirectory']
    })
    if(selectedPath) {
      defaultSavePath = selectedPath[0]
      win.webContents.send('download-path-change', defaultSavePath)
    }
  })
  //用于初始化路径
  ipcMain.on('download-path-change', (event, newPath: string) => {
    defaultSavePath = newPath
  })
  
  win.webContents.session.on('will-download', (event, item, webContents) => {
    item.setSavePath(path.resolve(defaultSavePath, item.getFilename()))
    const unit = downloadMap.get(item.getURL())!
    unit.music.size = item.getTotalBytes()
    unit.downloadItem = item//添加downloadItem
    webContents.send('download-confirm', unit.music)
    item.on('updated', (event, state) => {
      const { music } = downloadMap.get(item.getURL())!
      music.isPaused = item.isPaused()
      music.progress = 100 * item.getReceivedBytes() / item.getTotalBytes()
      music.receivedSize = item.getReceivedBytes()
      music.status = 'downloading'
      webContents.send('download-update', music)//更新进度
    })
    item.on('done', (event, state) => {
      const { music } = downloadMap.get(item.getURL())!
      music.isPaused = item.isPaused()
      music.progress = 100 * item.getReceivedBytes() / item.getTotalBytes()
      music.receivedSize = item.getReceivedBytes()
      if (state == 'completed') {
        music.status = 'success'
        const extname = path.extname(item.getFilename())
        const filename = music.name + extname
        const newPath = path.resolve(item.getSavePath(), '../' + filename)//文件重命名
        fs.renameSync(item.getSavePath(), newPath)
        downloadMap.delete(item.getURL())//移除队列
        webContents.send('download-completed', music)
      } else if (state == 'interrupted') {
        music.status = 'fail'
        downloadMap.delete(item.getURL())//移除队列
        webContents.send('download-failed', music)
      } else {
        downloadMap.delete(item.getURL())//仅移除队列
      }
    })
  })
}

app.whenReady().then(() => {
  createWindow()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length == 0) {
    createWindow()
  }
})

app.on('window-all-closed', () => {
  if (process.platform != 'darwin') {
    app.quit()
  }
})

interface DownloadMusic {
  key: string//下载标识
  name: string,
  url: string,
  progress: number,
  isPaused: boolean,
  status: 'downloading' | 'success' | 'fail',
  size: number,
  receivedSize: number
}