<template>
  <div class="download">
    <div class="banner">
      <el-image :src="record" />
      <div class="information">
        <h3>下载记录</h3>
        <div class="storage">
          <span class="path">储存目录: {{ downloadPath ? downloadPath: 'D:\\Repressive-Music' }}</span>
          <span class="location" @click="openDownloadPath">打开目录</span>
        </div>
        <p style="color: #909399;">tips:</p>
        <ol class="tips">
          <li>同首歌曲可以重复下载，文件名相同会覆盖（作者太垃圾）</li>
          <li>下载完成后只能删除记录（还要读写文件，实在是掉头发）</li>
          <li>页面只保存本次运行的下载记录（没完没了了）</li>
          <li>设置里可以改文件保存路径</li>
        </ol>
        <p class="motto">当一个bug能够运行，就不要再修改了——佚名</p>
      </div>
    </div>
    <el-divider />
    <div class="download-record">
      <div class="title">
        <span class="record-name">歌曲名</span>
        <span class="record-progress">下载进度</span>
        <span class="record-size">大小</span>
      </div>
      <ul class="record-list">
        <li class="record" v-for="item in downloadMusicList" :key="item.key">
          <span class="record-name">{{ item.name }}</span>
          <span class="record-progress">
            <el-progress :percentage="(Number)(item.progress.toFixed(2))" />
          </span>
          <span class="record-size" style="font-size: 12px;">{{
            item.status == 'success' ? getSize(item.size) :
              getSize(item.receivedSize) + '/' + getSize(item.size)
          }}</span>
          <span class="tools">
            <!-- <span class="status-icon" v-if="item.status == 'downloading'" @click="changeDownloadStatus(item)">
              <svg class="icon" v-if="item.isPaused" @click="changeDownloadStatus(item)">
                <use xlink:href="#icon-xiazai"></use>
              </svg>
              <svg class="icon" v-else>
                <use xlink:href="#icon-pause1"></use>
              </svg>
            </span> -->
            <span class="delete-icon" @click="deleteRecord(item)">
              <svg class="icon">
                <use xlink:href="#icon-shanchu1"></use>
              </svg>
            </span>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import record from '@/assets/record.png'
import useMusicStore from '@/store/musicStore'
import { DownloadMusic } from '@/type/music/Music'

const musicStore = useMusicStore()
const downloadMusicList = computed(() => musicStore.getDownloadMusicList)
const downloadPath = computed(() => musicStore.getDownloadPath)

//暂停或继续下载（暂时整不出来）
// const changeDownloadStatus = (music: DownloadMusic) => {
//   const rawMusic = toRaw(music)
//   window.electronWindowApi.changeDownload(rawMusic)
// }
const deleteRecord = (music: DownloadMusic) => {
  const rawMusic = toRaw(music)
  if (music.status == 'downloading') {
    window.electronWindowApi.cancelDownload(rawMusic)//传proxy的数据会报错
  }
  const index = downloadMusicList.value.map(item => item.key).indexOf(music.key)
  musicStore.$state.downloadMusicList.splice(index, 1)
}
const openDownloadPath = () => {
  window.electronWindowApi.openDownloadPath()
}
const getSize = (size: number) => {
  if (size < 1024) {
    return size + 'B'
  } else if (size >= 1024 && size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + 'K'
  } else if (size >= 1024 * 1024 && size < 1024 * 1024 * 1024) {
    return (size / 1024 / 1024).toFixed(2) + 'M'
  } else {
    return (size / 1024 / 1024 / 1024).toFixed(2) + 'G'
  }
}
</script>

<style lang="scss">
.download {
  height: calc(100vh - 160px);
  cursor: default;

  .banner {
    display: flex;
    height: 240px;
    padding: 5px 10px;

    .el-image {
      height: 240px;
      border-radius: 12px;
    }

    .information {
      padding: 16px 0 16px 24px;

      .storage {
        margin: 8px 0;
        font-size: 12px;
        height: 24px;
        line-height: 24px;

        .path {
          color: #909399;
        }

        .location {
          margin-left: 8px;
          color: #337ecc;
          cursor: pointer;
        }
      }

      .tips {
        font-size: 14px;
        padding: 0 12px;
        color: #909399;
      }

      .motto {
        margin-top: 20px;
        font-size: 12px;
        color: #606266;
      }
    }
  }

  .el-divider {
    margin: 12px 0;
  }

  .download-record {
    font-size: 14px;

    .title {
      padding: 0 18px;
      height: 40px;
      line-height: 40px;
      color: #606266;
    }

    span {
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .record-name {
      width: 200px;
      margin-right: 40px;
    }

    .record-progress {
      width: 300px;
      height: 100%;
      margin-right: 20px;

      .el-progress {
        height: 100%;
      }
    }

    .record-size {
      width: 150px;
    }

    .record-list {
      list-style: none;
      padding: 0 18px;
      color: #606266;

      .record {
        height: 24px;
        line-height: 24px;
        margin: 5px 0;

        .tools {
          height: 100%;

          span {
            height: 100%;
            cursor: pointer;
            margin: 0 5px;
          }

          .status-icon {

            svg {
              width: 18px;
              height: 18px;
            }
          }

          svg {
            width: 20px;
            height: 20px;
            fill: #909399;
          }
        }
      }
    }
  }
}
</style>