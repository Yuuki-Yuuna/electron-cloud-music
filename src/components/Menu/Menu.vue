<template>
  <div class="menu">
    <el-menu :default-active="defaultActive" :router="true">
      <el-menu-item index="home" route="/home">
        <svg class="icon">
          <use xlink:href="#icon-home"></use>
        </svg>
        <span>首页</span>
      </el-menu-item>
      <el-menu-item index="sheet" route="/sheet">
        <svg class="icon">
          <use xlink:href="#icon-playlistMusic"></use>
        </svg>
        <span>推荐歌单</span>
      </el-menu-item>
      <el-menu-item index="interest" route="/interest">
        <svg class="icon">
          <use xlink:href="#icon-radio"></use>
        </svg>
        <span>私人FM</span>
      </el-menu-item>
      <el-menu-item index="download" route="/download">
        <svg class="icon">
          <use xlink:href="#icon-download"></use>
        </svg>
        <span>下载记录</span>
      </el-menu-item>
      <h5 class="menu-title">我的音乐</h5>
      <el-menu-item index="favorite" route="/favorite">
        <svg class="icon">
          <use xlink:href="#icon-heart"></use>
        </svg>
        <span>喜欢的音乐</span>
      </el-menu-item>
      <el-menu-item index="rencently" route="/rencently">
        <svg class="icon">
          <use xlink:href="#icon-clockCircle"></use>
        </svg>
        <span>最近播放</span>
      </el-menu-item>
      <div v-if="userProfile" class="user-menu-item">
        <div class="title">
          <h5 class="menu-title" @click="changeCreatedListOpen">创建的歌单</h5>
          <span class="extend-icon" @click="changeCreatedListOpen">
            <svg class="icon" :style="isCreatedListOpen ? 'transform: rotate(90deg);' : ''">
              <use xlink:href="#icon-icretangle"></use>
            </svg>
          </span>
          <span class="add-icon" @click="openListCreateWindow">
            <svg class="icon">
              <use xlink:href="#icon-jiahao"></use>
            </svg>
          </span>
        </div>
        <div v-show="isCreatedListOpen" class="list-wrapper">
          <el-menu-item v-for="item in createdMusicList" :key="item.id" :index="(String)(item.id)"
            :route="`/list/${item.id}`" class="list">
            <svg class="icon">
              <use xlink:href="#icon-icon-list"></use>
            </svg>
            <span class="list-name">{{ item.name }}</span>
          </el-menu-item>
        </div>
        <div class="title">
          <h5 class="menu-title" @click="changeSubscribedOpen">收藏的歌单</h5>
          <span class="extend-icon" @click="changeSubscribedOpen">
            <svg class="icon" :style="isSubscribedOpen ? 'transform: rotate(90deg);' : ''">
              <use xlink:href="#icon-icretangle"></use>
            </svg>
          </span>
        </div>
        <div v-show="isSubscribedOpen" class="list-wrapper">
          <el-menu-item v-for="item in subscribedMusicList" :key="item.id" :index="(String)(item.id)"
            :route="`/sheet/detail/${item.id}`" class="list">
            <svg class="icon">
              <use xlink:href="#icon-icon-list"></use>
            </svg>
            <span class="list-name">{{ item.name }}</span>
          </el-menu-item>
        </div>
      </div>
    </el-menu>
    <el-dialog v-model="userStore.$state.showListCreateWindow" align-center class="list-create-dialog"
      :before-close="beforeListCreateClose">
      <h3>新建歌单</h3>
      <el-input v-model="createdListTitle" placeholder="输入歌单标题" maxlength="30" />
      <div class="buttons">
        <el-button type="primary" round :disabled="!createdListTitle" :loading="createloading"
          @click="createNewList">创建</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import useUserStore from '@/store/userStore'
import { getLikeList, getUserPlayList, createNewUserPlayList } from '@/api/musicUser'

const userStore = useUserStore()
const route = useRoute()
const defaultActive = computed(() => route.path.slice(1, route.path.length))//menu-item中route选项必填，否则多级路由跳转出bug
const userProfile = computed(() => userStore.getProfile)
const musicList = computed(() => userStore.getUserMusicList)
const createdMusicList = computed(() => musicList.value.filter(item => !item.subscribed))
const subscribedMusicList = computed(() => musicList.value.filter(item => item.subscribed))
const isCreatedListOpen = ref(true)
const isSubscribedOpen = ref(true)
const createdListTitle = ref('')//创建歌单标题
const createloading = ref(false)

watchEffect(async () => {
  if (!userProfile.value) {
    userStore.$state.userMusicList = []
    return
  }
  try {
    const userPlayListRes = await getUserPlayList({ uid: userProfile.value.userId })
    // console.log(res.data)
    if (userPlayListRes.data.code == 200) {
      const list = userPlayListRes.data.playlist
      userStore.$state.userMusicList = list.slice(1, list.length)
    } else {
      ElMessage.error(userPlayListRes.data.code + ' 请求失败')
    }
    const likeListRes = await getLikeList({ uid: userProfile.value.userId })
    if (likeListRes.data.code == 200) {
      userStore.$state.userLikeList = likeListRes.data.ids//获取喜欢音乐
    } else {
      ElMessage.error(likeListRes.data.code + ' 请求失败')
    }
  } catch (err) {
    console.log(err)
  }
})

const changeCreatedListOpen = () => {
  isCreatedListOpen.value = !isCreatedListOpen.value
}
const changeSubscribedOpen = () => {
  isSubscribedOpen.value = !isSubscribedOpen.value
}
const openListCreateWindow = () => {
  userStore.$state.showListCreateWindow = true
}
const beforeListCreateClose = (done: Function) => {
  if (!createloading.value) {
    createdListTitle.value = ''
    done()
  }
}
const createNewList = async () => {
  createloading.value = true
  try {
    const res = await createNewUserPlayList({ name: createdListTitle.value })
    const result = res.data
    if (result.code == 200) {
      userStore.$state.userMusicList.unshift(result.playlist)//这里没有再请求所有歌单
      ElMessage.success('创建成功')
    } else {
      ElMessage.error(result.code + ' 请求失败')
    }
  } catch (err) {
    console.log(err)
  }
  createdListTitle.value = ''
  userStore.$state.showListCreateWindow = false
  createloading.value = false
}
</script>

<style lang="scss">
.menu {
  display: flex;
  flex-direction: column;
  align-items: center;

  .el-menu {
    width: 160px;
    padding-top: 12px;
    height: calc(100vh - 60px);
    overflow-y: scroll;

    .menu-title {
      font-size: 12px;
      font-weight: 400;
      color: #909399;
      padding: 8px 0 0 24px;
      cursor: default;
    }

    .title {
      display: flex;
      align-items: center;
      position: relative;
      padding: 8px 24px;
      cursor: pointer;

      h5 {
        padding: 0;
        cursor: pointer;
      }

      .extend-icon {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .add-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);

        svg {
          width: 16px;
          height: 16px;
        }
      }

      svg {
        width: 24px;
        height: 24px;
      }
    }

    .list-wrapper {
      // transition: 2s ease-out;
      // overflow: hidden;

      .list {

        .list-name {
          width: 120px;
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        svg {
          width: 20px;
          height: 20px;
        }
      }
    }

    .el-menu-item {
      height: 40px;

      &:hover {
        background-color: #F0F2F5;
      }
    }

    .el-menu-item.is-active {
      color: black;
      font-weight: 700;
      background-color: #F0F2F5;
    }
  }

  svg {
    width: 18px;
    height: 18px;
    padding-right: 4px;
    fill: #606266;
  }
}

.list-create-dialog {

  h3 {
    text-align: center;
    margin-bottom: 24px;
  }

  .buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
  }
}
</style>