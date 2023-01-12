<template>
  <div class="sheet">
    <div class="banner">
      <img :src="KON" />
      <div class="banner-content">
        <h4>歌单——<span style="font-size: 12px;">{{ selectedTag }}</span></h4>
        <div class="banner-music">
          <el-image src="http://p2.music.126.net/B_sCLXthAHgoVEMIRNU1hw==/109951163559682176.jpg" />
          <div class="info">
            <div class="name">Cagayake! GIRLS</div>
            <div class="artist">桜高軽音部</div>
          </div>
          <span class="play-icon" @click="playKon">
            <svg class="icon">
              <use xlink:href="#icon-bofang"></use>
            </svg>
          </span>
        </div>
        <h5 style="margin-top: 20px;">分类</h5>
        <div class="tags">
          <span :class="selectedTag == item ? 'tag tag-active' : 'tag'" v-for="(item, index) in categories" :key="index"
            @click="changeTag(item)">
            {{ item }}
          </span>
        </div>
      </div>
    </div>
    <el-divider />
    <el-skeleton :loading="loading" animated :throttle="200">
      <template #template>
        <ul class="song-sheets">
          <li class="song-sheet" v-for="num in 4" :key="num">
            <el-skeleton-item variant="image" style="width: 180px; height: 180px; border-radius: 8px;" />
            <el-skeleton-item variant="p" style="width: 180px; margin-top: 10px;" />
          </li>
        </ul>
      </template>
      <ul class="song-sheets">
        <li class="song-sheet" v-for="sheet in songSheets" :key="sheet.id">
          <div class="img-wrapper" @click="toSheetDetail(sheet.id)">
            <el-image :src="sheet.coverImgUrl" />
            <div class="count">
              <svg class="icon">
                <use xlink:href="#icon-play-count"></use>
              </svg>
              <span>{{ sheet.playCount >= 100000 ? (sheet.playCount / 10000).toFixed(0) + '万' : sheet.playCount }}</span>
            </div>

          </div>
          <p class="info">{{ sheet.name }}</p>
        </li>
      </ul>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
import KON from '@/assets/k-on.jpg'
import useMusicStore from '@/store/musicStore'
import { Music, PlayListCard } from '@/type/music/Music'
import { getHighqualityPlayList } from '@/api/musicPlayList'
import { getSongDetail } from '@/api/musicDetail'

const router = useRouter()
const musicStore = useMusicStore()
const categories = ['ACG', '轻音乐', '影视原声', '流行', '欧美', '英伦', '日语', '学习', '夜晚', '电子', '爵士']
const songSheets: PlayListCard[] = reactive([])
const selectedTag = ref('ACG')
const loading = ref(false)
let themeMusic: Music | null = null

watchEffect(async () => {
  loading.value = true
  try {
    const res = await getHighqualityPlayList({ cat: selectedTag.value })
    const result = res.data
    // console.log(result)
    if (result.code == 200) {
      songSheets.splice(0, songSheets.length, ...result.playlists)
    } else {
      ElMessage.error(result.code + ' 请求失败')
    }
  } catch (err) {
    console.log(err)
  }
  loading.value = false
})

const changeTag = (tag: string) => {
  if (!loading.value) {
    selectedTag.value = tag
  }
}
//播放K-on!
const playKon = () => {
  if (themeMusic) {
    musicStore.insert(themeMusic)
  }
}
const toSheetDetail = (id: number) => {
  router.push(`/sheet/detail/${id}`)
}

onBeforeMount(async () => {
  try {
    const res = await getSongDetail({ ids: '26201861' })
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
.sheet {
  height: calc(100vh - 160px);

  .banner {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5px 10px;
    height: 280px;

    img {
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

        img {
          width: 60px;
          height: 60px;
          border-radius: 8px;
        }
      }

      .tags {
        display: flex;

        flex-wrap: wrap;
        margin: 24px 0;

        .tag {
          padding: 4px 6px;
          background-color: #79bbff;
          border-radius: 6px;
          color: #fff;
          font-size: 12px;
          cursor: pointer;
          margin: 5px;
        }

        .tag:hover,
        .tag-active {
          background-color: #409EFF;
        }
      }

      .el-pagination {
        justify-content: center;
        align-items: center;
      }
    }
  }

  .el-divider {
    margin: 12px 0;
  }

  .song-sheets {
    height: calc(100vh - 465px);
    display: flex;
    flex-wrap: wrap;
    overflow-y: scroll;
    padding: 0 12px;

    .song-sheet {
      width: 25%;
      overflow: hidden;
      margin-bottom: 12px;

      .img-wrapper {
        position: relative;
        width: fit-content;
        margin: 0 auto;

        .count {
          position: absolute;
          top: 4px;
          right: 20px;
          font-size: 12px;
          color: #e5f3ff;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: default;

          span {
            padding-left: 4px;
          }
        }

        .el-image {
          display: block;
          filter: brightness(0.94);
          cursor: pointer;
        }

        img {
          display: block;
          width: 180px;
          height: 180px;
          border-radius: 8px;
        }
      }

      .info {
        text-indent: 4px;
        padding: 0 16px;
        font-size: 14px;
      }
    }
  }
}
</style>