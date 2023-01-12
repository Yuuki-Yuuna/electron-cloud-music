<template>
  <div class="favorite">
    <div class="banner">
      <el-image :src="favorite" />
      <div class="information">
        <div class="title">
          <el-tag size="small">歌单</el-tag>
          <h3>喜欢的音乐</h3>
        </div>
        <div class="buttons">
          <el-button type="primary" round @click="playMusicList">
            <svg class="icon">
              <use xlink:href="#icon-bofang1"></use>
            </svg>
            播放全部
          </el-button>
        </div>
        <p class="total">共计歌曲{{ musicList.length }}首</p>
        <p class="motto">你所热爱的，就是你的生活——<i>Cherry Chen</i></p>
      </div>
    </div>
    <el-divider />
    <PlayList :loading="loading" :play-list="musicList" height="calc(100vh - 475px)" />
  </div>
</template>

<script setup lang="ts">
import favorite from '@/assets/favorite.jpg'
import useMusicStore from '@/store/musicStore'
import useUserStore from '@/store/userStore'
import { Music } from '@/type/music/Music'
import { getLikeList } from '@/api/musicUser'
import { getSongDetail } from '@/api/musicDetail'

const musicStore = useMusicStore()
const userStore = useUserStore()
const loading = ref(false)
const musicList = reactive<Music[]>([])

watchEffect(async () => {
  if (!userStore.getProfile) {
    return
  }
  loading.value = true
  try {
    // console.log(userStore.getProfile)
    const likeListRes = await getLikeList({ uid: userStore.getProfile.userId })
    // console.log(likeListRes.data)
    if (likeListRes.data.code == 200) {
      userStore.$state.userLikeList = likeListRes.data.ids
      const musicDetailRes = await getSongDetail({ ids: likeListRes.data.ids.toString() })
      const result = musicDetailRes.data
      // console.log(result)
      if (result.code == 200) {
        musicList.splice(0, musicList.length, ...result.data)
      } else {
        ElMessage.error(result.code + ' 请求失败')
      }
    } else {
      ElMessage.error(likeListRes.data.code + ' 请求失败')
    }
  } catch (err) {
    console.log(err)
  }
  loading.value = false
})

const playMusicList = () => {
  musicStore.musicList = musicList
  musicStore.$state.index = 0
}
</script>

<style lang="scss">
.favorite {
  height: calc(100vh - 160px);

  .banner {
    display: flex;
    padding: 10px 20px;
    height: 240px;
    cursor: default;

    .el-image {
      border-radius: 12px;
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

      .buttons {
        display: flex;
        align-items: center;
        margin: 16px 0;

        svg {
          margin-right: 4px;
        }
      }

      .total {
        font-size: 14px;
        padding-left: 8px;
      }

      .motto {
        margin-top: 12px;
        padding-left: 8px;
        font-size: 12px;
      }
    }
  }

  .el-divider {
    margin: 12px 0;
  }
}
</style>