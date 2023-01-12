<template>
  <div class="rencently">
    <div class="banner">
      <div class="title">
        <h3>最近播放</h3>
        <span>共{{ musicList.length }}首</span>
      </div>
      <div class="buttons">
        <el-button type="primary" round @click="playMusicList">
          <svg class="icon">
            <use xlink:href="#icon-bofang1"></use>
          </svg>
          播放全部
        </el-button>
      </div>
    </div>
    <el-divider />
    <PlayList :loading="loading" :play-list="musicList" height="calc(100vh - 315px)" />
  </div>
</template>

<script setup lang="ts">
import useUserStore from '@/store/userStore'
import useMusicStore from '@/store/musicStore'
import { Music } from '@/type/music/Music'
import { getRencentSong } from '@/api/musicUser'
import { getSongDetail } from '@/api/musicDetail'

const userStore = useUserStore()
const musicStore = useMusicStore()
const loading = ref(false)
const musicList = reactive<Music[]>([])

watchEffect(async () => {
  if (!userStore.getProfile) {
    return
  }
  loading.value = true
  try {
    const rencentSongRes = await getRencentSong()
    if (rencentSongRes.data.code == 200) {
      const ids = rencentSongRes.data.data.list.map(item => item.resourceId).toString()
      const songDetailRes = await getSongDetail({ ids })
      // console.log(songDetailRes.data)
      if (songDetailRes.data.code == 200) {
        musicList.splice(0, musicList.length, ...songDetailRes.data.data)
      } else {
        ElMessage.error(songDetailRes.data.code + ' 请求失败')
      }
    } else {
      ElMessage.error(rencentSongRes.data.code + ' 请求失败')
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
.rencently {
  height: calc(100vh - 160px);

  .banner {
    padding: 10px 20px;
    height: 80px;
    cursor: default;

    .title {
      display: flex;
      align-content: center;

      span {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: 10px;
        font-size: 12px;
        color: #909399;
      }
    }

    .buttons {
      display: flex;
      align-items: center;
      margin-top: 10px;

      svg {
        margin-right: 4px;
      }
    }
  }

  .el-divider {
    margin: 12px 0;
  }
}
</style>