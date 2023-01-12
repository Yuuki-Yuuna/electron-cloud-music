<template>
  <Navigation />
  <div class="layout">
    <Menu />
    <div class="content">
      <RouterView />
      <Player />
    </div>
  </div>
</template>

<script setup lang="ts">
import { DownloadMusic } from '@/type/music/Music'
import useMusicStore from './store/musicStore'

const musicStore = useMusicStore()
const electronWindowApi = window.electronWindowApi

const updateDownloadStatus = (music: DownloadMusic) => {
  const list = musicStore.$state.downloadMusicList
  const index = list.map(item => item.url).indexOf(music.url)
  list[index] = music
}

//有音乐添加下载时
electronWindowApi.listenDownloadConfirm((event, music: DownloadMusic | null) => {
  if (music) {
    musicStore.$state.downloadMusicList.unshift(music)
    ElMessage.success('已添加至下载队列')
  } else {
    ElMessage.warning('添加的音乐正在下载中')
  }
})
//下载进度反馈
electronWindowApi.listenDownloadUpdate((event, music: DownloadMusic) => {
  updateDownloadStatus(music)
})
//下载成功时
electronWindowApi.listenDownloadCompleted((event, music: DownloadMusic) => {
  updateDownloadStatus(music)
})
//下载失败时
electronWindowApi.listenDownloadFailed((event, music: DownloadMusic) => {
  updateDownloadStatus(music)
  ElMessage.error('一个任务下载失败')
})
electronWindowApi.listenDownloadPathChange((event, newPath: string) => {
  localStorage.setItem('downloadPath', newPath)
  musicStore.$state.downloadPath = newPath
})

onBeforeMount(() => {
  const downloadPath = localStorage.getItem('downloadPath')
  if (downloadPath) {
    window.electronWindowApi.changeDownloadPath(downloadPath)
  }
})
</script>

<style lang="scss">
.layout {
  display: flex;

  .content {
    flex: 1;
  }
}
</style>