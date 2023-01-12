<template>
  <div class="option">
    <div class="download-option">
      <h4>下载设置</h4>
      <div class="path-title">
        <span style="color: #606266;">下载目录：</span>
        <span style="color: #909399; font-size: 12px;">默认将音乐储存在此目录</span>
      </div>
      <div class="path">
        <span>{{ downloadPath ? downloadPath : 'D:\\Repressive-Music' }}</span>
        <el-button round size="small" @click="changeDownloadPath">更改</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useMusicStore from '@/store/musicStore'

const musicStore = useMusicStore()
const downloadPath = computed(() => musicStore.getDownloadPath)

const changeDownloadPath = () => {
  window.electronWindowApi.selectDownloadPath()
}
</script>

<style lang="scss">
.option {
  height: calc(100vh - 160px);
  padding: 12px 24px;
  cursor: default;

  .download-option {

    .path-title {
      height: 25px;
      line-height: 25px;
      padding: 0 10px;
      margin-top: 6px;
    }

    .path {
      padding: 0 12px;
      font-size: 12px;
      color: #909399;

      .el-button {
        margin-left: 12px;
      }
    }
  }
}
</style>