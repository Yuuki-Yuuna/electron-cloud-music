<template>
  <div class="interest">
    <div class="music-manage">
      <div class="music-option">
        <div class="music-cover-wrapper">
          <div :class="coverClassNames[0]" :style="coverStyle" @click="previousMusic">
            <el-image :src="musicList[0]?.cover + '?param=300y300'">
              <template #error>
                <div style="width: 100%; height: 100%;"></div>
              </template>
            </el-image>
          </div>
          <div :class="coverClassNames[1]" :style="coverStyle">
            <el-image :src="musicList[1]?.cover + '?param=300y300'">
              <template #error>
                <div style="width: 100%; height: 100%;"></div>
              </template>
            </el-image>
          </div>
          <div :class="coverClassNames[2]" :style="coverStyle">
            <el-image :src="musicList[2]?.cover + '?param=300y300'" />
          </div>
        </div>
        <div class="music-buttons">
          <span @click="playCurrentMusic">
            <svg class="icon">
              <use xlink:href="#icon-play-count"></use>
            </svg>
          </span>
          <span @click="changeLikeStatus">
            <svg v-if="music && userLikeList.includes(music.id)" class="icon">
              <use xlink:href="#icon-aixin1"></use>
            </svg>
            <svg v-else class="icon">
              <use xlink:href="#icon-aixin"></use>
            </svg>
          </span>
          <span @click="nextMusic">
            <svg class="icon">
              <use xlink:href="#icon-play-next"></use>
            </svg>
          </span>
          <el-popover v-model:visible="showColletion" placement="top-start" :show-arrow="false" :width="160"
            popper-class="collection-popper" trigger="click">
            <template #reference>
              <span>
                <svg class="icon">
                  <use xlink:href="#icon-folder-add"></use>
                </svg>
              </span>
            </template>
            <el-menu>
              <el-menu-item index="new" @click="createNewUserList">
                <svg class="icon">
                  <use xlink:href="#icon-xinjian"></use>
                </svg>
                <span>新建歌单</span>
              </el-menu-item>
              <el-menu-item :index="(String)(item.id)" v-for="item in createdMusicList" :key="item.id"
                @click="collectSelectedMusic(item.id)">
                <svg class="icon">
                  <use xlink:href="#icon-icon-list"></use>
                </svg>
                <span>{{ item.name }}</span>
              </el-menu-item>
            </el-menu>
          </el-popover>
        </div>
      </div>
    </div>
    <div class="music-information">
      <div class="music-title">
        <span class="music-name">{{ music?.name }}</span>
        <el-tag v-if="music?.privilege.plLevel == 'none'" effect="dark" size="small">VIP</el-tag>
      </div>
      <div class="music-info">
        <span class="music-artist">{{ music?.aritists.toString().replace(',', '，') }}</span>
        <span class="music-album">{{ music?.album? '专辑：' + music.album : '' }}</span>
      </div>
      <ul class="lyric" ref="lyricRef">
        <li v-for="item in lyrics" :key="item[0]" :class="lightTime == item[0] ? 'current' : ''">
          <p>{{ item[1] }}</p>
          <p>{{ tlyrics.get(item[0]) ? tlyrics.get(item[0]) : '' }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import useMusicStore from '@/store/musicStore'
import useUserStore from '@/store/userStore'
import { Music } from '@/type/music/Music'
import { getUserFM } from '@/api/musicUser'
import { getMusicLyric } from '@/api/musicDetail'
import { likeMusic, operateUserPlayList } from '@/api/musicUser'

type CoverClassName = 'music-hidden' | 'music-first' | 'music-second' | 'music-third'

const musicStore = useMusicStore()
const userStore = useUserStore()
const musicList = reactive<Array<Music | null>>([null])//第一位留空
const music = computed(() => musicList[1])
const coverClassNames = reactive<CoverClassName[]>(['music-first', 'music-second', 'music-third'])
const coverStyle = ref('transition: 0.8s ease-out;')
let transforming = false//限制速度
const loading = ref(false)
const lyricRef = ref<HTMLUListElement | null>(null)
const lyrics = reactive(new Map<string, string>())//lyrc歌词
const tlyrics = reactive(new Map<string, string>())//翻译歌词
const musicTime = computed(() => musicStore.getTime)
const lightTime = ref('00:00')//高亮时间
const userLikeList = computed(() => userStore.getUserLikeList)
const userMusicList = computed(() => userStore.getUserMusicList)
const createdMusicList = computed(() => userMusicList.value.filter(item => !item.subscribed))
const likeLoading = ref(false)
const showColletion = ref(false)

watchEffect(async () => {
  //存在下一个不请求
  if (musicList.length > 3) {
    return
  }
  loading.value = true
  try {
    const res = await getUserFM()
    const result = res.data
    if (result.code == 200) {
      result.data.forEach(item => musicList.push(item))
    } else {
      ElMessage.error(result.code + ' 请求失败')
    }
  } catch (err) {
    console.log(err)
  }
  loading.value = false
})

watch(music, async () => {
  if (!music.value) {
    return
  }
  loading.value = true
  try {
    const res = await getMusicLyric({ id: music.value.id })
    // console.log(res.data)
    const lyric = res.data.lrc.lyric
    const tlyric = res.data.tlyric.lyric
    const reg = /\d{2}:\d{2}.{3}/ //只匹配xx:xx不匹配小数点
    lyrics.clear()
    lyric.split('\n').forEach(item => {
      const result = item.match(reg)
      // console.log(result)
      result ? lyrics.set(toApproximateTime(result[0]), item.split(']')[1]) : null
    })
    tlyrics.clear()
    tlyric.split('\n').forEach(item => {
      const result = item.match(reg)
      result ? tlyrics.set(toApproximateTime(result[0]), item.split(']')[1]) : null
    })
    musicStore.insert(music.value)
  } catch (err) {
    console.log(err)
  }
  loading.value = false
})

watch(musicTime, () => {
  // console.log(musicTime.value)
  const lyc = lyrics.get(musicTime.value)
  if (lyc) {
    lightTime.value = musicTime.value
    let index = 0
    let flag = false
    lyrics.forEach((value, key) => {
      if (key == musicTime.value) {
        flag = true
      }
      index += flag ? 0 : 1
    })
    console.log(index)
    const element = lyricRef.value!
    let offest = 0
    for (let j = 0; j < index - 3; j++) {
      offest += element.children[j].clientHeight
    }
    console.log(offest)
    element.scrollTop = offest
  }
  // console.log(lyricRef.value?.children)
})

const nextMusic = () => {
  if (transforming || loading.value) {
    return
  }
  transforming = true
  const oldCoverClassNames = [...coverClassNames]
  const newCoverClassNames: CoverClassName[] = ['music-hidden', 'music-first', 'music-second']
  coverClassNames.splice(0, coverClassNames.length, ...newCoverClassNames)
  setTimeout(() => {
    coverStyle.value = ''
    coverClassNames.splice(0, coverClassNames.length, ...oldCoverClassNames)
    musicList.shift()
    setTimeout(() => {
      coverStyle.value = 'transition: 0.8s ease-out;'
      transforming = false
    }, 200)
  }, 1000)
}
const previousMusic = () => {
  if (transforming || loading.value) {
    return
  }
  transforming = true
  const oldCoverClassNames = [...coverClassNames]
  const newCoverClassNames: CoverClassName[] = ['music-second', 'music-third', 'music-hidden']
  coverClassNames.splice(0, coverClassNames.length, ...newCoverClassNames)
  setTimeout(() => {
    coverStyle.value = ''
    coverClassNames.splice(0, coverClassNames.length, ...oldCoverClassNames)
    musicList.unshift(null)
    setTimeout(() => {
      coverStyle.value = 'transition: 0.8s ease-out;'
      transforming = false
    }, 200)
  }, 1000)
}
//近似分秒(传入xx:xx.xxx)
const toApproximateTime = (str: string) => {
  let [time, ms] = str.split('.')
  let [m, s] = time.split(':')
  let sec = (Number)(m) * 60 + (Number)(s) + ((Number)(ms) > 500 ? 1 : 0)
  m = Math.floor(sec / 60) < 10 ? '0' + Math.floor(sec / 60) : (String)(Math.floor(sec / 60))
  s = sec % 60 < 10 ? '0' + sec % 60 : (String)(sec % 60)
  return m + ':' + s
}
const playCurrentMusic = () => {
  if (music.value) {
    musicStore.insert(music.value)
  }
}
const changeLikeStatus = async () => {
  if (!music.value || likeLoading.value) {
    return
  }
  const id = music.value.id
  const like = !userLikeList.value.includes(id)
  likeLoading.value = true
  try {
    const res = await likeMusic({ id, like })
    if (res.data.code == 200) {
      const list = userStore.$state.userLikeList
      const index = list.indexOf(id)
      index == -1 ? list.push(id) : list.splice(index, 1)
      ElMessage.success(like ? '添加成功' : '取消成功')
    } else {
      ElMessage.error(res.data.code + ' 请求失败')
    }
  } catch (err) {
    console.log(err)
  }
  likeLoading.value = false
}
const createNewUserList = () => {
  if (!userStore.getProfile) {
    userStore.$state.showLoginWindow = true
    return
  }
  userStore.$state.showListCreateWindow = true
}
const collectSelectedMusic = async (pid: number) => {
  if (!music.value) {
    ElMessage.warning('未选中音乐，请重试')
    return
  }
  const tracks = (String)(music.value.id)
  try {
    const res = await operateUserPlayList({ op: 'add', pid, tracks })
    const result = res.data.body
    if (result.code == 200) {
      ElMessage.success('添加成功')
    } else {
      ElMessage.error(result.message)
    }
  } catch (err) {
    console.log(err)
  }
}
</script>

<style lang="scss">
.interest {
  height: calc(100vh - 160px);
  display: flex;
  cursor: default;

  .music-manage {
    width: 450px;
    padding: 60px 0 60px 0;

    .music-option {

      //便宜小动画
      .music-cover-wrapper {
        position: relative;
        height: 300px;
        overflow: hidden;
        margin-right: 15px;

        .music-hidden {
          display: none;
        }

        .music-first {
          position: absolute;
          right: 0px;
          transform: translateX(-25%) scale(0.8, 0.8);
          cursor: pointer;
        }

        .music-second {
          position: absolute;
          right: 0px;
          z-index: 10;
        }

        .music-third {
          position: absolute;
          right: 0px;
          transform: translateX(100%);
          z-index: 10;
        }

        .el-image {
          width: 300px;
          height: 300px;
          border-radius: 6px;

          .el-image__inner {
            background-color: transparent;
          }
        }
      }
    }

    .music-buttons {
      display: flex;
      justify-content: center;
      align-content: center;
      margin-top: 32px;
      padding-left: 80px;

      span {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 15px;
        border: 2px solid #D4D7DE;
        border-radius: 50%;
        padding: 6px;
        cursor: pointer;

        &:hover {
          background-color: #F0F2F5;
        }

        svg {
          width: 24px;
          height: 24px;
        }
      }
    }
  }

  .music-information {
    flex: 1;
    padding: 24px;

    .music-title {
      display: flex;
      align-items: center;
      margin-top: 10px;

      .music-name {
        max-width: 240px;
        font-size: 18px;
        margin-right: 15px;
      }
    }

    .music-name,
    .music-artist,
    .music-album {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .music-info {
      display: flex;
      align-items: center;
      margin-top: 10px;
      font-size: 12px;
      color: #909399;

      .music-artist {
        max-width: 120px;
        font-size: 12px;
      }

      .music-album {
        max-width: 180px;
        margin-left: 20px;
      }
    }

    .lyric {
      list-style: none;
      height: 400px;
      overflow-y: scroll;
      font-size: 14px;
      margin-top: 16px;

      li {
        min-height: 50px;

        p {
          margin: 2px 0;
        }
      }

      .current {
        font-weight: 700;
      }
    }
  }
}

.collection-popper {
  // display: block !important;
  padding: 0 !important;
  user-select: none;

  .el-menu {
    min-width: 0;
    width: 100%;
    padding: 0;
    margin: 0;
    max-height: 360px;
    overflow-y: scroll;

    .el-menu-item {
      width: 100%;
      font-size: 13px;
      height: 36px;
      line-height: 36px;

      span {
        display: inline-block;
        width: 140px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }


      &:hover {
        background-color: #F0F2F5;
      }

      svg {
        width: 20px;
        height: 20px;
        fill: #606266;
        margin-right: 10px;
      }
    }
  }
}
</style>