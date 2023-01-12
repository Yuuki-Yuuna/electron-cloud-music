<template>
  <div class="player">
    <div v-show="!music" class="mask"></div>
    <div class="music-info">
      <el-image :src="music?.cover">
        <template #error>
          <div style="width: 80px; height: 80px;"></div>
        </template>
      </el-image>
      <div class="info">
        <div class="name">{{ music?.name? music.name : '未知歌曲' }}</div>
        <div class="artist">{{ music?.aritists.length ? music.aritists.toString() : '未知歌手' }} </div>
      </div>
    </div>
    <div class="player-content">
      <div class="player-control">
        <div class="buttons">
          <el-tooltip :content="playModeMessage" trigger="click" placement="top">
            <span class="order" @click="changePlayMode">
              <svg v-if="playMode == PlayMode.order" class="icon">
                <use xlink:href="#icon-repeat"></use>
              </svg>
              <svg v-else-if="playMode == PlayMode.shuffle" class="icon">
                <use xlink:href="#icon-shuffle"></use>
              </svg>
              <svg v-else-if="playMode == PlayMode.loop" class="icon">
                <use xlink:href="#icon-repeatOnce"></use>
              </svg>
              <svg v-else class="icon">
                <use xlink:href="#icon-redo"></use>
              </svg>
            </span>
          </el-tooltip>
          <span class="previous" @click="() => playMode == PlayMode.shuffle ? nextMusicRandom() : lastMusic()">
            <svg class="icon">
              <use xlink:href="#icon-previous"></use>
            </svg>
          </span>
          <span v-if="playing" class="play" @click="pause">
            <svg class="icon">
              <use xlink:href="#icon-pause"></use>
            </svg>
          </span>
          <span v-else class="play" @click="play">
            <svg class="icon">
              <use xlink:href="#icon-play"></use>
            </svg>
          </span>
          <span class="next" @click="() => playMode == PlayMode.shuffle ? nextMusicRandom() : nextMusic()">
            <svg class="icon">
              <use xlink:href="#icon-next"></use>
            </svg>
          </span>
        </div>
        <div class="player-slider">
          <span :style="`visibility: ${music ? 'visible ' : 'hidden'};`">{{ toTime(musicCurrentTime) }}</span>
          <el-slider v-model="progress" @change="changeCurrentTime" @input="recordProgress" :show-tooltip="false"
            style="width: 380px" />
          <span :style="`visibility: ${music ? 'visible ' : 'hidden'};`">{{ toTime(musicDuration) }}</span>
        </div>
      </div>
      <div class="player-option">
        <div class="volume">
          <span class="voice">
            <svg v-if="volume == 0" class="icon">
              <use xlink:href="#icon-volumeDisable"></use>
            </svg>
            <svg v-else-if="volume > 0 && volume <= 30" class="icon">
              <use xlink:href="#icon-volumeLow"></use>
            </svg>
            <svg v-else-if="volume > 30 && volume <= 70" class="icon">
              <use xlink:href="#icon-volumeMiddle"></use>
            </svg>
            <svg v-else class="icon">
              <use xlink:href="#icon-volumeHigh"></use>
            </svg>
          </span>
          <el-slider v-model="volume" @input="changeVolume" style="width: 70px" />
        </div>
        <span class="list">
          <el-popover placement="top" trigger="click" :show-arrow="false" :offset="40" :width="400"
            popper-class="current-list-popper">
            <template #reference>
              <svg class="icon">
                <use xlink:href="#icon-playlist"></use>
              </svg>
            </template>
            <div class="current-list">
              <div class="title">
                <h3>当前播放</h3>
                <div class="info">
                  <span class="total">总{{ playList.length }}首</span>
                  <span style="flex: 1;"></span>
                  <span class="clear" @click="clearCurrentList">清空列表</span>
                </div>
              </div>
              <el-divider />
              <ul class="music-list">
                <li class="music" v-for="(item, index) in playList" :key="item.id" @dblclick="playSelectedMusic(index)">
                  <span v-if="music?.id == item.id" class="play-icon">
                    <svg v-if="playing">
                      <use xlink:href="#icon-play"></use>
                    </svg>
                    <svg v-else>
                      <use xlink:href="#icon-pause"></use>
                    </svg>
                  </span>
                  <div class="music-title">
                    <span class="music-name">{{ item.name }}</span>
                    <el-tag v-if="item.privilege.plLevel == 'none'" effect="dark" size="small">VIP</el-tag>
                  </div>
                  <span class="music-artist">{{ item.aritists.toString() }}</span>
                  <span class="music-duration">{{ musicdt(item.duration) }}</span>
                  <span class="delete-icon" @click="removeSelectedMusic(index)">
                    <svg>
                      <use xlink:href="#icon-shanchu"></use>
                    </svg>
                  </span>
                </li>
              </ul>
            </div>
          </el-popover>
        </span>
      </div>
    </div>
    <audio ref="audio" @timeupdate="getCurrentTime" @canplay="onPlayReady" style="display: none" />
  </div>
</template>

<script setup lang="ts">
import useMusicStore from '@/store/musicStore'
import { musicdt } from '@/util/tools'

enum PlayMode {
  once,//单曲播放
  order,//顺序播放
  shuffle,//随机播放
  loop//单曲循环
}

const musicStore = useMusicStore()
const audio = ref<HTMLAudioElement | null>(null)
const music = computed(() => musicStore.music)
const playList = computed(() => musicStore.getMusicList)
const progress = ref(0)//进度条
let latestProgress = 0//el-slider松开时触发，值已被audio更新，需记录
const volume = ref(60)// 歌曲音量
let needPlay = false//是否需要播放(播放是异步的吃了不少苦头)
const playing = ref(false)
const musicDuration = ref(0)
const musicCurrentTime = ref(0)
// const cover = ref('https://p1.music.126.net/GxHt2cn9sUUssps2zYfLVw==/109951164745729828.jpg')
const playMode = ref(PlayMode.once)
const playModeMessage = computed(() => {
  switch (playMode.value) {
    case PlayMode.once: return '单曲播放'
    case PlayMode.order: return '顺序播放'
    case PlayMode.shuffle: return '随机播放'
    case PlayMode.loop: return '单曲循环'
  }
})

watch(music, () => {
  setCurrentMusic()
})

const setCurrentMusic = () => {
  if (!audio.value) {
    return
  }
  if (music.value) {
    audio.value.src = music.value.url
    // cover.value = music.value.cover
    //初始化不自动播放
    if (musicStore.$state.initial) {
      musicStore.$state.initial = false
    } else {
      needPlay = true
    }
  } else {
    pause()
    audio.value.currentTime = 0
  }
}
const lastMusic = () => {
  pause()
  const length = musicStore.$state.musicList.length
  const index = musicStore.$state.index
  musicStore.$state.index = index - 1 >= 0 ? index - 1 : length - 1
}
const nextMusic = () => {
  pause()
  const length = musicStore.$state.musicList.length
  const index = musicStore.$state.index
  musicStore.$state.index = index + 1 < length ? index + 1 : 0
}
const nextMusicRandom = () => {
  pause()
  const next = Math.round(Math.random() * (musicStore.$state.musicList.length - 1))
  if (next == musicStore.$state.index) {
    nextMusicRandom()
  } else {
    musicStore.$state.index = next
  }
}
const getCurrentTime = () => {
  const element = audio.value!
  musicCurrentTime.value = element.currentTime
  musicStore.$state.time = toTime(element.currentTime)
  progress.value = (musicCurrentTime.value / musicDuration.value) * 100
  if (musicCurrentTime.value >= musicDuration.value && playing.value) {
    switch (playMode.value) {
      case PlayMode.order:
        nextMusic()
        break
      case PlayMode.loop:
        audio.value!.load()
        break
      case PlayMode.shuffle:
        nextMusicRandom()
        break
      default:
        pause()
    }
  }
}
const changeCurrentTime = () => {
  const ct = (latestProgress * musicDuration.value) / 100
  if (audio.value) {
    audio.value.currentTime = ct
  }
}
const recordProgress = () => {
  latestProgress = progress.value
}
const changeVolume = () => {
  if (audio.value) {
    audio.value.volume = volume.value / 100
  }
}
const onPlayReady = () => {
  const element = audio.value!
  musicDuration.value = isFinite(element.duration) ? element.duration : 0
  if (needPlay) {
    setTimeout(play, 500)
    needPlay = false
  }
}
const play = () => {
  audio.value?.play()
  playing.value = true
}
const pause = () => {
  audio.value?.pause()
  playing.value = false
}
const changePlayMode = () => {
  playMode.value = (playMode.value + 1) % 4
}
//秒数转化为mm:ss形式
const toTime = (sec: number) => {
  sec = Math.round(sec)
  let s = sec % 60 < 10 ? '0' + (sec % 60) : sec % 60
  let min = Math.floor(sec / 60) < 10 ? '0' + Math.floor(sec / 60) : Math.floor(sec / 60)
  return min + ":" + s
}
const playSelectedMusic = (index: number) => {
  musicStore.$state.index = index
}
const clearCurrentList = () => {
  musicStore.$state.musicList = []
  musicStore.$state.index = 0
}
const removeSelectedMusic = (index: number) => {
  musicStore.remove(index)
}

onMounted(() => {
  if (audio.value) {
    audio.value.volume = volume.value / 100
    musicStore.initMusicList()//初始化播放列表
  }
})
</script> 

<style lang="scss">
.player {
  height: 100px;
  display: flex;
  align-items: center;
  position: relative;
  padding: 0 10px;
  border-top: 1px solid #DCDFE6;
  cursor: default;

  .mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    background-color: #F0F2F5;
    opacity: 0.4;
  }

  .music-info {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 200px;

    .el-image {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .info {
      padding: 6px;
      font-size: 14px;
      font-weight: 400;
      color: #909399;
      cursor: default;

      .name,
      .artist {
        max-width: 120px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .name {
        font-size: 16px;
        margin-bottom: 10px;
        color: #000;
        cursor: pointer;
      }
    }
  }

  .player-content {
    display: flex;
    align-items: center;
    height: 100%;

    .player-control {
      width: 450px;

      .buttons {
        display: flex;
        justify-content: center;
        align-items: center;

        span {
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          margin: 0 12px;

          svg {
            width: 20px;
            height: 20px;
          }
        }

        .play {
          border-radius: 50%;
          padding: 8px;
          background-color: #EBEEF5;
        }
      }

      .player-slider {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 6px;

        span {
          margin: 0 15px;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }

    .player-option {
      display: flex;
      align-items: center;
      margin-left: 36px;

      .volume {
        display: flex;
        align-items: center;
        margin-right: 16px;

        .voice {
          margin-right: 15px;
        }
      }

      .list {
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }

    .el-slider__button-wrapper {
      scale: 0.6;
      transform: translateX(-100%);
    }
  }
}

.current-list-popper {
  padding: 12px 0 !important;

  .current-list {
    height: calc(100vh - 190px);
    cursor: default;

    .title {
      height: 60px;
      padding: 0 12px;

      .info {
        display: flex;
        align-items: center;
        margin-top: 12px;

        .total {
          color: #909399;
        }

        .clear {
          color: #337ecc;
          cursor: pointer;
          font-size: 12px;
        }
      }
    }

    .el-divider {
      margin: 12px auto;
      width: 90%;
    }

    .music-list {
      height: calc(100% - 75px);
      list-style: none;
      overflow-y: scroll;

      .music {
        display: flex;
        align-content: center;
        position: relative;
        font-size: 14px;
        height: 36px;
        padding: 0 24px;

        &:hover {
          background-color: #F0F2F5;
        }

        .play-icon {
          display: flex;
          justify-content: center;
          align-items: center;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          left: 4px;

          svg {
            width: 12px;
            height: 12px;
          }
        }

        .music-name,
        .music-artist,
        .music-duration {
          display: inline-block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 36px;
        }

        .music-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 150px;
          margin-right: 10px;

          .music-name {
            width: 120px;
            margin-right: 10px;
          }

          .el-tag--small {
            padding: 0 4px;
            height: 16px;
            font-size: 10px;
            border-radius: 4px;
          }
        }

        .music-artist {
          width: 100px;
        }

        .music-duration {
          margin-left: 20px;
          width: 40px;
          color: #909399;
        }

        .delete-icon {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-left: 10px;
          cursor: pointer;

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