<template>
  <div class="profile">
    <div class="user-info">
      <el-image :src="userProfile?.avatarUrl" />
      <div class="information">
        <h2>{{ userProfile?.nickname }}</h2>
        <div class="vip">
          <el-tag effect="dark" round :color="userProfile?.vipType ? '#409EFF' : '#909399'">VIP</el-tag>
          <span class="vip-info">{{ userProfile?.vipType? '尊贵会员': '普通用户' }}</span>
        </div>
        <el-divider />
        <p class="sign">签名：<i>{{ userProfile?.signature? userProfile.signature: '暂无签名' }}</i></p>
      </div>
    </div>
    <el-tabs v-model="activeName">
      <el-tab-pane label="创建的歌单" name="create">
        <div class="playlist">
          <div class="list" v-for="item in createdMusicList" :key="item.id">
            <el-image :src="item.coverImgUrl" fit="cover" @click="toCreatedDetail(item.id)" />
            <div class="name">{{ item.name }}</div>
            <p>{{ item.trackCount }}首</p>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="收藏的歌单" name="subscribe">
        <div class="playlist">
          <div class="list" v-for="item in subscribedMusicList" :key="item.id">
            <el-image :src="item.coverImgUrl" fit="cover" @click="toSubscribedDetail(item.id)" />
            <div class="name">{{ item.name }}</div>
            <p>{{ item.trackCount }}首</p>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import useUserStore from '@/store/userStore'
import { getUserPlayList } from '@/api/musicUser'

type ActiveName = 'create' | 'subscribe'

const router = useRouter()
const userStore = useUserStore()
const userProfile = computed(() => userStore.getProfile)
const activeName = ref<ActiveName>('create')
const musicList = computed(() => userStore.getUserMusicList)
const createdMusicList = computed(() => musicList.value.filter(item => !item.subscribed))
const subscribedMusicList = computed(() => musicList.value.filter(item => item.subscribed))

watchEffect(async () => {
  if (!userProfile.value) {
    return
  }
  try {
    const res = await getUserPlayList({ uid: userProfile.value.userId })
    // console.log(res.data)
    if (res.data.code == 200) {
      const list = res.data.playlist
      userStore.$state.userMusicList = list.slice(1, list.length)
    } else {
      ElMessage.error(res.data.code + ' 请求失败')
    }
  } catch (err) {
    console.log(err)
  }
})

const toCreatedDetail = (id: number) => {
  router.push(`/list/${id}`)
}
const toSubscribedDetail = (id: number) => {
  router.push(`/sheet/detail/${id}`)
}
</script>

<style lang="scss">
.profile {
  height: calc(100vh - 160px);

  .user-info {
    display: flex;
    align-items: center;
    padding: 24px;
    height: 250px;

    .el-image {
      width: 200px;
      height: 200px;
      border-radius: 50%;
    }

    .information {
      flex: 1;
      margin-left: 20px;

      .vip {
        margin-top: 12px;
        height: 32px;
        line-height: 32px;

        .el-tag {
          width: 40px;
          border-color: transparent;
        }

        .vip-info {
          font-size: 12px;
          margin-left: 6px;
        }
      }

      .el-divider {
        margin: 12px 0;
      }

      .sign {
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        i {
          font-style: normal;
          color: #909399;
        }
      }
    }
  }

  .el-tabs {
    padding: 0 24px;
    cursor: default;

    .playlist {
      display: flex;
      flex-wrap: wrap;
      height: calc(100vh - 465px);
      overflow-y: scroll;
      padding: 0 6px;

      .list {
        width: 25%;
        padding: 5px 0;

        .el-image {
          display: block;
          margin: 0 auto;
          width: 180px;
          height: 180px;
          border-radius: 12px;
          cursor: pointer;
        }

        .name {
          font-size: 14px;
          margin: 4px 0;
          padding: 0 14px;
        }

        p {
          font-size: 10px;
          color: #909399;
          padding: 0 14px;
        }
      }
    }
  }
}
</style>