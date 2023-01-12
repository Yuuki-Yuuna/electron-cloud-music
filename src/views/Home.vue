<template>
  <div class="home">
    <div class="banner-wrapper">
      <div class="banner">
        <div class="banner-content">
          <h2>
            <svg class="icon">
              <use xlink:href="#icon-renzheng"></use>
            </svg>
            境界的彼方
          </h2>
          <p class="banner-text">
            《境界的彼方》是由鸟居奈古梦著作、鸭居知世插画的轻小说，于2012年6月9日，由KAESUMA文库文库（京都动画）发行。小说曾获得第2回京都动画大赏（小说部门）奖励赏。改编自小说的同名电视动画已于2013年10月至12月播出。
          </p>
        </div>
        <img :src="danceMk" />
      </div>
    </div>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="热门" name="hot" :disabled="loading">
        <h5>ACG精选</h5>
        <PlayList :play-list="list" :loading="loading" height="calc(100vh - 555px)" />
      </el-tab-pane>
      <el-tab-pane label="最新" name="new" :disabled="loading">
        <h5>新曲一览</h5>
        <PlayList :play-list="list" :loading="loading" height="calc(100vh - 555px)" />
      </el-tab-pane>
      <el-tab-pane label="推荐" name="recommend" :disabled="loading">
        <h5>某人的歌单</h5>
        <PlayList :play-list="list" :loading="loading" height="calc(100vh - 555px)" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import danceMk from '@/assets/danceMk.png'
import { Music } from '@/type/music/Music'
import { getStyleSong, getPersonalizedNewSong } from '@/api/musicRecommend'
import { getPlayListAll } from '@/api/musicPlayList'
import { Response } from '@/type/music/Response'

type Tab = 'hot' | 'new' | 'recommend'

const activeTab = ref<Tab>('hot')
const list = reactive<Music[]>([])
const loading = ref(false)

watchEffect(async () => {
  loading.value = true
  try {
    let res: Response<Music[]> | null = null
    switch (activeTab.value) {
      case 'hot':
        res = await getStyleSong({ tagId: 1315 })
        break
      case 'new':
        res = await getPersonalizedNewSong({ limit: 20 })
        break
      case 'recommend':
        res = await getPlayListAll({ id: 7764512269 })
    }
    const result = res.data
    if (result.code == 200) {
      list.splice(0, list.length, ...result.data)
    } else {
      ElMessage.error(result.code + ' 请求失败')
    }
  } catch (err) {
    console.log(err)
  }
  loading.value = false
})
</script>

<style lang="scss">
.home {
  height: calc(100vh - 160px);
  cursor: default;

  .banner-wrapper {
    padding: 12px;
    height: 270px;

    .banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 14px;
      background: url('@/assets/banner.jpg');
      margin-top: 50px;

      .banner-content {
        padding: 10px;
        color: #ebecec;

        h2 {
          font-weight: 500;
          font-size: 18px;
          margin-bottom: 10px;
        }

        .banner-text {
          width: 300px;
          font-weight: 400;
          font-size: 14px;
          line-height: 1.7em;
        }
      }

      img {
        width: 480px;
        object-fit: cover;
        margin-top: -65px;
      }
    }
  }

  .el-tabs {
    padding: 0 12px;
    height: 40px;

    h5 {
      height: 20px;
      padding-left: 8px;
    }
  }
}
</style>