<template>
  <div class="sheet-detail">
    <el-skeleton :loading="loading" animated :throttle="200">
      <template #template>
        <div class="banner">
          <el-skeleton-item variant="image" style="width: 200px; height: 200px; border-radius: 6px;" />
          <div class="information">
            <el-skeleton-item style="width: 240px; height: 25px; margin: 5px 0;" />
            <div class="buttons">
              <el-skeleton-item variant="button"
                style="margin: 0 5px; width: 105px; height: 32px; border-radius: 12px;" />
              <el-skeleton-item variant="button"
                style="margin: 0 5px; width: 105px; height: 32px; border-radius: 12px;" />
            </div>
            <div class="ul-loading">
              <el-skeleton-item />
              <el-skeleton-item />
              <el-skeleton-item variant="p" style="width: 200px;" />
            </div>
          </div>
        </div>
      </template>
      <div class="banner">
        <el-image :src="sheet?.coverImgUrl" />
        <div class="information">
          <div class="title">
            <el-tag size="small">精品歌单</el-tag>
            <h3>{{ sheet?.name }}</h3>
          </div>
          <div class="buttons">
            <el-button type="primary" round @click="playMusicList" :disabled="musicList.length == 0">
              <svg class="icon">
                <use xlink:href="#icon-bofang1"></use>
              </svg>
              播放全部
            </el-button>
            <el-button type="primary" round @click="changeColletionStatus" :loading="collectLoading">
              <template v-if="isCollected">
                <svg class="icon" v-show="!collectLoading">
                  <use xlink:href="#icon-shoucang-ok"></use>
                </svg>
                已收藏
              </template>
              <template v-else>
                <svg class="icon" v-show="!collectLoading">
                  <use xlink:href="#icon-shoucang"></use>
                </svg>
                添加收藏
              </template>
            </el-button>
          </div>
          <ul>
            <li class="tags">标签: {{ sheet?.tags.toString() }}</li>
            <li class="count">歌曲: {{ sheet?.trackCount }}&nbsp;&nbsp;&nbsp;播放: {{ sheet?.playCount }}</li>
            <li class="description">简介：{{ sheet?.description }}</li>
          </ul>
        </div>
      </div>
    </el-skeleton>
    <PlayList :playList="musicList" :loading="loading" height="calc(100vh - 450px)" />
  </div>
</template>

<script setup lang="ts">
import { getPlayListDetail, getPlayListAll } from '@/api/musicPlayList'
import { PlayListCard, Music } from '@/type/music/Music'
import useMusicStore from '@/store/musicStore'
import useUserStore from '@/store/userStore'
import { getUserPlayList, subscribePlaylist } from '@/api/musicUser'

const musicStore = useMusicStore()
const userStore = useUserStore()
const route = useRoute()
const idParam = computed(() => route.params.id ? (Number)(route.params.id) : null)
const sheet = ref<PlayListCard | null>(null)
const loading = ref(false)
const musicList = reactive<Music[]>([])
const userProfile = computed(() => userStore.getProfile)
const userMusicList = computed(() => userStore.getUserMusicList)
const isCollected = ref(false)
const collectLoading = ref(false)

const playMusicList = () => {
  musicStore.$state.musicList = musicList
  musicStore.$state.index = 0
}

watchEffect(async () => {
  if (!idParam.value) {
    return
  }
  loading.value = true
  try {
    const res = await getPlayListDetail({ id: idParam.value })
    const result = res.data
    // console.log(result)
    if (result.code == 200) {
      sheet.value = result.playlist
    } else {
      ElMessage.error(result.code + ' 请求失败')
    }
  } catch (err) {
    console.log(err)
  }
  try {
    const res = await getPlayListAll({ id: idParam.value })
    const result = res.data
    if (result.code == 200) {
      musicList.splice(0, musicList.length, ...result.data)
    } else {
      ElMessage.error(result.code + ' 请求失败')
    }
  } catch (err) {
    console.log(err)
  }
  loading.value = false
})

watchEffect(() => {
  if (idParam.value && userProfile.value) {
    isCollected.value = userMusicList.value.filter(item => item.id == idParam.value).length > 0
  }
})

const changeColletionStatus = async () => {
  if (!idParam.value || !userProfile.value) {
    userStore.$state.showLoginWindow = !userProfile.value ? true : false
    return
  }
  collectLoading.value = true
  try {
    const res = await subscribePlaylist({ t: !isCollected.value ? 1 : 2, id: idParam.value })
    // console.log(res.data)
    if (res.data.code == 200) {
      const userPlayListRes = await getUserPlayList({ uid: userProfile.value.userId })
      const list = userPlayListRes.data.playlist
      userStore.$state.userMusicList = list.slice(1, list.length)
      isCollected.value = !isCollected.value
      if (isCollected.value) {
        ElMessage.success('收藏成功')
      } else {
        ElMessage.success('取消收藏成功')
      }
    } else {
      ElMessage.error(res.data.code + ' 请求失败')
    }
  } catch (err) {
    console.log(err)
  }
  collectLoading.value = false
}
</script>

<style lang="scss">
.sheet-detail {
  height: calc(100vh - 160px);

  .banner {
    display: flex;
    // align-items: center;
    padding: 10px 20px;
    height: 240px;
    cursor: default;

    .el-image {
      width: 200px;
      height: 200px;
      object-fit: cover;
      border-radius: 6px;
    }

    .information {
      padding: 10px 0 0 20px;

      .title {
        display: flex;
        align-items: center;

        h3 {
          margin-left: 12px;
        }
      }

      .ul-loading {
        display: flex;
        flex-direction: column;

        .el-skeleton__item {
          width: 120px;
          margin: 4px 0;
        }
      }

      .buttons {
        display: flex;
        align-items: center;
        margin: 16px 0;

        svg {
          margin-right: 4px;
        }
      }

      ul {
        font-size: 14px;
        color: #606266;
        list-style: none;

        li {
          margin: 4px 0;
        }

        .description {
          display: -webkit-box;
          width: 420px;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}
</style>