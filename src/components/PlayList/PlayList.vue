<template>
  <div class="playlist">
    <div class="playlist-title">
      <span class="title-name">歌曲名</span>
      <span class="title-singer">歌手</span>
      <span class="title-album">专辑</span>
      <span class="title-time">时间</span>
    </div>
    <el-skeleton :loading="loading" animated :throttle="200">
      <template #template>
        <ul class="music-list" :style="'height: ' + height">
          <li class="music-loading" v-for="num in 10" :key="num">
            <div class="music-name">
              <el-skeleton-item variant="image" style="width: 32px; height: 32px; border-radius: 6px;" />
              <el-skeleton-item style="width: 120px; margin-left: 10px;" />
            </div>
            <div class="music-singer">
              <el-skeleton-item style="width: 100px; " />
            </div>
            <div class="music-album">
              <el-skeleton-item style="width: 80px;" />
            </div>
            <div class="music-time">
              <el-skeleton-item style="width: 60px;" />
            </div>
          </li>
        </ul>
      </template>
      <ul class="music-list" :style="'height: ' + height">
        <li class="music" v-for="(item, index) in playList" :key="item.id" @dblclick="playMusicList(index)"
          @contextmenu="openContextMenu($event, item)">
          <div class="music-name">
            <el-image :src="item.cover" />
            <span>{{ item.name }}</span>
            <el-tag v-if="item.privilege.plLevel == 'none'" effect="dark" size="small">VIP</el-tag>
          </div>
          <div class="music-singer">
            <span>{{ item.aritists.toString() }}</span>
          </div>
          <div class="music-album">
            <span>{{ item.album ? item.album : '暂缺' }}</span>
          </div>
          <div class="music-time">
            <span>{{ musicdt(item.duration) }}</span>
          </div>
          <div class="tools">
            <span @click="playSelectedMusic(item)">
              <svg class="icon">
                <use xlink:href="#icon-bofang"></use>
              </svg>
            </span>
            <span @click="selectDownloadQuality(item)">
              <svg class="icon">
                <use xlink:href="#icon-xiazai"></use>
              </svg>
            </span>
          </div>
        </li>
      </ul>
    </el-skeleton>
    <el-dialog v-model="showDownloadWindow" title="下载选项" class="download-dialog" align-center
      :before-close="beforeDialogClose">
      <el-radio-group v-model="downloadQuality">
        <el-radio :label="128000">标准音质（128K）</el-radio>
        <el-radio :label="320000">高品音质（320K）</el-radio>
        <el-radio :label="999000">无损音质</el-radio>
      </el-radio-group>
      <div class="buttons">
        <el-button type="primary" @click="downloadMusic" :loading="downloadLoading">确认</el-button>
        <el-button @click="downloadCancel">取消</el-button>
      </div>
    </el-dialog>
    <div v-show="showContextMenu" class="context-menu" ref="contextMenuRef" @contextmenu="stopPropagation">
      <el-menu :collapse="true" active-text-color="var(--text-color)">
        <el-menu-item index="play" @click="playSelectedMusic(selectedMusic)">
          <svg class="icon">
            <use xlink:href="#icon-bofang"></use>
          </svg>
          播放
        </el-menu-item>
        <el-menu-item index="like" @click="changeLikeStatus">
          <template v-if="selectedMusic ? userLikeList.includes(selectedMusic.id) : false">
            <svg class=" icon">
              <use xlink:href="#icon-aixin1"></use>
            </svg>
            取消喜欢
          </template>
          <template v-else>
            <svg class=" icon">
              <use xlink:href="#icon-aixin"></use>
            </svg>
            添加喜欢
          </template>
        </el-menu-item>
        <el-sub-menu index="collect" popper-class="playlist-context-popper" :show-timeout="100">
          <template #title>
            <div class="sub-menu" @click="stopPropagation">
              <svg class="icon">
                <use xlink:href="#icon-folder-add"></use>
              </svg>
              收藏到歌单
              <svg class="icon arrow">
                <use xlink:href="#icon-icretangle"></use>
              </svg>
            </div>
          </template>
          <div @contextmenu="stopPropagation">
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
          </div>
        </el-sub-menu>
        <el-menu-item index="download" @click="selectDownloadQuality(selectedMusic)">
          <svg class="icon">
            <use xlink:href="#icon-xiazai"></use>
          </svg>
          下载
        </el-menu-item>
        <el-menu-item v-if="route.path.includes('/list')" index="delete" @click="deleteSelectedMusic">
          <svg class="icon">
            <use xlink:href="#icon-shanchu1"></use>
          </svg>
          从歌单删除
        </el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
import useUserStore from '@/store/userStore'
import useMusicStore from '@/store/musicStore'
import { Music } from '@/type/music/Music'
import { musicdt } from '@/util/tools'
import { getMusicDownload } from '@/api/musicDetail'
import { likeMusic, operateUserPlayList } from '@/api/musicUser'

interface PropsType {
  playList: Music[]
  loading: boolean
  height: string
}

type MusicQuality = 128000 | 320000 | 999000//标准，高品，无损

const props = defineProps<PropsType>()

const route = useRoute()
const userStore = useUserStore()
const musicStore = useMusicStore()
const userMusicList = computed(() => userStore.getUserMusicList)
const createdMusicList = computed(() => userMusicList.value.filter(item => !item.subscribed))
const userLikeList = computed(() => userStore.getUserLikeList)
const showDownloadWindow = ref(false)
const downloadQuality = ref<MusicQuality>(128000)
const selectedMusic = ref<Music | null>(null)
const downloadLoading = ref(false)
const showContextMenu = ref(false)//右键菜单开关
const contextMenuRef = ref<HTMLDivElement | null>(null)

//插入播放队列
const playSelectedMusic = (music: Music | null) => {
  if (music) {
    musicStore.insert(music)
  }
}
//替换播放队列
const playMusicList = (index: number) => {
  musicStore.$state.musicList = [...props.playList]//props是个引用不能直接给出去
  musicStore.$state.index = index
}
const beforeDialogClose = (done: Function) => {
  if (!downloadLoading.value) {
    selectedMusic.value = null
    done()
  }
}
const selectDownloadQuality = (music: Music | null) => {
  if (!music) {
    ElMessage.warning('未选中音乐，请重试')
    return
  }
  const dlLevel = music.privilege.dlLevel
  if (!dlLevel || dlLevel == 'none') {
    ElMessage.warning('仅限VIP下载')
    return
  }
  showDownloadWindow.value = true
  selectedMusic.value = music
}
const downloadCancel = () => {
  if (!downloadLoading.value) {
    selectedMusic.value = null
    showDownloadWindow.value = false
  }
}
const downloadMusic = async () => {
  if (!selectedMusic.value) {
    ElMessage.warning('未选中音乐，请重试')
    return
  }
  downloadLoading.value = true
  try {
    const res = await getMusicDownload({ id: selectedMusic.value.id, br: downloadQuality.value })
    const result = res.data
    if (result.code == 200) {
      if (result.data.url) {
        const musicName = selectedMusic.value.aritists.toString() + '-' + selectedMusic.value.name
        window.electronWindowApi.download(musicName, result.data.url)
      } else {
        ElMessage.warning('该音质为VIP专享')
      }
    } else {
      ElMessage.error(result.code + ' 请求失败')
    }
  } catch (err) {
    console.log(err)
  }
  downloadLoading.value = false
  showDownloadWindow.value = false
}
const openContextMenu = (event: MouseEvent, music: Music) => {
  if (!contextMenuRef.value) {
    return
  }
  event.preventDefault()
  event.stopPropagation()//禁止冒泡
  selectedMusic.value = music
  const style = contextMenuRef.value.style
  style.top = event.clientY + 'px'
  style.left = event.clientX + 'px'
  showContextMenu.value = true
}
const closeContextMenu = () => {
  if (!showDownloadWindow.value) {
    selectedMusic.value = null//有可能不是右键菜单下载
  }
  showContextMenu.value = false
}
const stopPropagation = (event: MouseEvent) => {
  event.stopPropagation()//阻止冒泡
}
//添加喜欢或取消喜欢
const changeLikeStatus = async () => {
  if (!selectedMusic.value) {
    ElMessage.warning('未选中音乐，请重试')
    return
  }
  const id = selectedMusic.value.id
  const like = !userLikeList.value.includes(id)
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
}
//添加收藏
const collectSelectedMusic = async (pid: number) => {
  if (!selectedMusic.value) {
    ElMessage.warning('未选中音乐，请重试')
    return
  }
  const tracks = (String)(selectedMusic.value.id)
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
const deleteSelectedMusic = async () => {
  if (!selectedMusic.value) {
    ElMessage.warning('未选中音乐，请重试')
    return
  }
  if (typeof route.params.id == 'string') {
    const pid = (Number)(route.params.id)
    const tracks = (String)(selectedMusic.value.id)
    try {
      const res = await operateUserPlayList({ op: 'del', pid, tracks })
      const result = res.data.body
      if(result.code == 200) {
        userStore.$state.userMusicList = [...userStore.$state.userMusicList]//刷新一下
        ElMessage.success('删除成功')
      } else {
        ElMessage.error(result.message)
      }
    } catch (err) {
      console.log(err)
    }
  }
}
const createNewUserList = () => {
  if(!userStore.getProfile) {
    userStore.$state.showLoginWindow = true
    return
  }
  userStore.$state.showListCreateWindow = true
}

onBeforeMount(() => {
  window.addEventListener('click', closeContextMenu)
  window.addEventListener('contextmenu', closeContextMenu)
})
onBeforeUnmount(() => {
  window.removeEventListener('click', closeContextMenu)
  window.removeEventListener('contextmenu', closeContextMenu)
})
</script>

<style lang="scss">
.playlist {

  .playlist-title {
    display: flex;
    align-items: center;
    user-select: none;
    padding: 10px 18px;
    font-size: 14px;
    height: 50px;
    color: #606266;

    .title-name {
      width: 250px;
    }

    .title-singer {
      width: 160px;
    }

    .title-album {
      width: 200px;
    }

    .title-time {
      width: 120px;
    }
  }

  .music-list {
    overflow-y: scroll;
    color: #606266;

    .music,
    .music-loading {
      display: flex;
      padding: 5px 18px;
      font-size: 14px;
      cursor: default;

      .music-name {
        display: flex;
        align-items: center;
        width: 250px;

        .el-tag {
          height: 16px;
          padding: 0 2px;
          font-size: 10px;
          margin-left: 6px;
        }

        img {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          margin-right: 8px;
        }
      }

      .music-singer,
      .music-album {
        display: flex;
        align-items: center;
        width: 200px;
      }

      .music-singer {
        width: 160px;
      }

      .music-time {
        display: flex;
        align-items: center;
        width: 120px;
      }

      span {
        max-width: 150px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }

    .music:hover {
      background-color: #F0F2F5;
    }

    .tools {
      display: flex;
      justify-content: center;
      align-items: center;

      span {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0 3px;
        cursor: pointer;
      }

      svg {
        width: 24px;
        height: 24px;
      }
    }
  }

  .context-menu {
    position: fixed; //相对于浏览器定位
    top: 0;
    left: 0;
    transform: translateY(-100%);
    width: 160px;
    background-color: #fff;
    box-shadow: var(--el-box-shadow-light);
    z-index: 10;
    cursor: default;
    user-select: none;

    .el-menu {
      width: 100%;

      .el-menu-item {
        font-size: 13px;
        height: 36px;
        line-height: 36px;

        &:hover {
          background-color: #F0F2F5;
        }
      }

      .el-sub-menu,
      .el-sub-menu__title {
        font-size: 13px;
        height: 36px;
        line-height: 36px;

        &:hover {
          background-color: #F0F2F5;
        }

        .sub-menu {
          display: flex;
          align-items: center;
        }

        .arrow {
          position: absolute;
          top: 50%;
          right: 0px;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
        }
      }

      svg {
        width: 16px;
        height: 16px;
        fill: #606266;
        margin-right: 10px;
      }
    }
  }
}

.download-dialog {
  width: 300px;

  .el-dialog__body {
    padding: 12px 24px;
  }

  .el-radio-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-left: 12px;
  }

  .buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
  }
}

.playlist-context-popper {
  width: 160px;
  user-select: none;
  border: none;

  .el-menu {
    min-width: 0;
    width: 100%;
    padding: 0;
    margin: 0;
    max-height: 520px;
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