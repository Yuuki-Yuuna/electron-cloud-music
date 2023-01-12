<template>
  <div class="search">
    <div class="banner">
      <el-image :src="kessokuBand" />
      <div class="banner-content">
        <div class="banner-music">
          <el-image src="http://p1.music.126.net/KcRtt7Vi4b-jWSKmCgb8zQ==/109951168110222499.jpg" />
          <div class="info">
            <div class="name">星座になれたら</div>
            <div class="artist">結束バンド</div>
          </div>
          <span class="play-icon" @click="playBochi">
            <svg class="icon">
              <use xlink:href="#icon-bofang"></use>
            </svg>
          </span>
        </div>
        <div class="search-result">
          <h4>{{ keywords }} 的搜索结果</h4>
          <p>共计歌曲{{ songCount }}首</p>
        </div>
        <div class="buttons">
          <el-button type="primary" round @click="playMusicList">
            <svg class="icon">
              <use xlink:href="#icon-bofang1"></use>
            </svg>
            播放全部
          </el-button>
        </div>
        <el-pagination small background layout="prev, pager, next" style="margin-left: 12px;"
          :total="songCount * 10 / 100" v-model:current-page="currentPage" />
      </div>
    </div>
    <el-divider />
    <PlayList :play-list="musicList" :loading="loading" height="calc(100vh - 520px)" />
  </div>
</template>

<script setup lang="ts">
import kessokuBand from '@/assets/kessokuBand.jpg'
import { Music } from '@/type/music/Music'
import useMusicStore from '@/store/musicStore'
import { getSearchResult } from '@/api/search'
import { getSongDetail } from '@/api/musicDetail'

const route = useRoute()
const router = useRouter()
const musicStore = useMusicStore()
const keywords = computed(() => route.query.keywords ? route.query.keywords as string : '')
let themeMusic: Music | null = null
const musicList = reactive<Music[]>([])
const songCount = ref(0)
const loading = ref(false)
const currentPage = ref(1)

watchEffect(async () => {
  if (keywords.value) {
    loading.value = true
    try {
      const offset = (currentPage.value - 1) * 100
      const res = await getSearchResult({ keywords: keywords.value, limit: 100, offset })
      const result = res.data
      if (result.code == 200) {
        // console.log(result)
        songCount.value = result.data.songCount
        musicList.splice(0, musicList.length, ...result.data.songs)
      } else {
        ElMessage.error(result.code + ' 请求失败')
      }
    } catch (err) {
      console.log(err)
    }
    loading.value = false
  }
})

const playMusicList = () => {
  musicStore.musicList = musicList
  musicStore.$state.index = 0
}
const playBochi = () => {
  if (themeMusic) {
    musicStore.insert(themeMusic)
  }
}

onBeforeMount(async () => {
  if (!keywords.value) {
    router.replace('/')
  }
  try {
    const res = await getSongDetail({ ids: '2003496380' })
    const result = res.data
    if (result.code == 200) {
      themeMusic = result.data[0]
    } else {
      ElMessage.error(result.code + ' 请求失败')
    }
  } catch (err) {
    console.log(err)
  }
})
</script>

<style lang="scss">
.search {
  height: calc(100vh - 160px);

  .banner {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5px 10px;
    height: 280px;

    .el-image {
      height: 100%;
      border-radius: 14px;
      object-fit: cover;
    }

    .banner-content {
      width: 300px;
      height: 100%;
      padding: 16px 0 16px 24px;
      cursor: default;

      .banner-music {
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: var(--el-box-shadow-lighter);
        border-radius: 14px;
        padding: 10px;
        margin: 16px 0;

        .el-image {
          width: 60px;
          height: 60px;
          border-radius: 8px;
        }

        .info {
          padding-left: 12px;
          font-weight: 400;

          .name {
            font-style: italic;
            font-size: 14px;
          }

          .artist {
            font-size: 12px;
            margin-top: 12px;
          }
        }

        .play-icon {
          margin-left: 24px;
          cursor: pointer;

          svg {
            width: 24px;
            height: 24px;
          }
        }
      }

      .search-result {
        padding-left: 12px;

        p {
          font-size: 12px;
        }
      }

      .buttons {
        margin: 12px 0 24px 0;
        padding-left: 10px;
      }
    }
  }

  .el-divider {
    margin: 12px 0;
  }
}
</style>