<template>
  <div class="user-list">
    <el-skeleton :loading="loading" animated :throttle="200">
      <template #template>
        <div class="banner">
          <el-skeleton-item variant="image" style="width: 200px; height: 200px; border-radius: 6px;" />
          <div class="information">
            <el-skeleton-item style="width: 240px; height: 25px; margin: 5px 0;" />
            <el-skeleton-item style="display: block; width: 160px;" />
            <div class="buttons">
              <el-skeleton-item variant="button"
                style="margin: 0 5px; width: 105px; height: 32px; border-radius: 12px;" />
            </div>
            <div class="ul-loading">
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
            <el-tag size="small">歌单</el-tag>
            <h3>{{ sheet?.name }}</h3>
            <div class="option">
              <span class="icon-span" @click="editUserList">
                <svg class="icon">
                  <use xlink:href="#icon-edit"></use>
                </svg>
              </span>
              <el-popconfirm width="150" confirm-button-text="确认" cancel-button-text="取消" icon-color="#626AEF"
                title="确认删除歌单?" @confirm="deleteUserList">
                <template #reference>
                  <span class="icon-span">
                    <svg class="icon" style="width: 18px; height: 18px;">
                      <use xlink:href="#icon-shanchu1"></use>
                    </svg>
                  </span>
                </template>
              </el-popconfirm>
            </div>
          </div>
          <div class="create-time">创建于{{ sheet? new Date(sheet.createTime).toLocaleDateString() : ' -' }}</div>
          <div class="buttons">
            <el-button type="primary" round @click="playMusicList" :disabled="musicList.length == 0">
              <svg class="icon">
                <use xlink:href="#icon-bofang1"></use>
              </svg>
              播放全部
            </el-button>
          </div>
          <ul>
            <li class="count">歌曲: {{ sheet?.trackCount }}&nbsp;&nbsp;&nbsp;播放: {{ sheet?.playCount }}</li>
            <li class="description">简介：{{ sheet?.description? sheet.description : '暂无简介' }}</li>
          </ul>
        </div>
      </div>
    </el-skeleton>
    <el-divider />
    <PlayList :loading="loading" :play-list="musicList" height="calc(100vh - 475px)" />
    <el-dialog v-model="showEditWindow" align-center class="list-edit-dialog" :before-close="beforeEditClose"
      :width="400">
      <h3>编辑歌单信息</h3>
      <div class="name">
        <span>歌单名：</span>
        <el-input v-model="editListName" />
      </div>
      <div class="description">
        <span>简介：</span>
        <el-input v-model="editDescription" type="textarea" :rows="3" />
      </div>
      <div class="buttons">
        <el-button type="primary" round :loading="editLoading" @click="updateUserList"
          :disabled="!editListName">保存</el-button>
        <el-button round @click="editClose">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import router from '@/router'
import useMusicStore from '@/store/musicStore'
import useUserStore from '@/store/userStore'
import { Music } from '@/type/music/Music'
import { getPlayListAll } from '@/api/musicPlayList'
import { deleteUserPlayList, updateUserPlayList } from '@/api/musicUser'

const route = useRoute()
const musicStore = useMusicStore()
const userStore = useUserStore()
const idParam = computed(() => route.params.id ? (Number)(route.params.id) : null)
const userProfile = computed(() => userStore.getProfile)
const userMusicList = computed(() => userStore.getUserMusicList)
const sheet = computed(() => {
  const list = userMusicList.value.filter(item => item.id == idParam.value)
  return list.length ? list[0] : null
})
const musicList = reactive<Music[]>([])
const loading = ref(false)
const showEditWindow = ref(false)
const editListName = ref('')
const editDescription = ref('')
const editLoading = ref(false)

watch(userProfile, () => {
  router.replace('/home')//userMusicList的维护交由Menu组件处理
})

watchEffect(async () => {
  if (!sheet.value) {
    return
  }
  loading.value = true
  try {
    const res = await getPlayListAll({ id: sheet.value.id })
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

const playMusicList = () => {
  musicStore.$state.musicList = musicList
  musicStore.$state.index = 0
}
//删除歌单
const deleteUserList = async () => {
  if (!idParam.value) {
    return
  }
  try {
    const id = idParam.value
    const res = await deleteUserPlayList({ id })
    if (res.data.code == 200) {
      router.replace('/home')
      userStore.$state.userMusicList = userStore.$state.userMusicList.filter(item => item.id != id)
      ElMessage.success('删除成功')
    } else {
      ElMessage.error(res.data.code + ' 请求失败')
    }
  } catch (err) {
    console.log(err)
  }
}
const editUserList = () => {
  if (sheet.value) {
    editListName.value = sheet.value.name
    editDescription.value = sheet.value.description ? sheet.value.description : ''
  }
  showEditWindow.value = true
}
const beforeEditClose = (done: Function) => {
  if (!editLoading.value) {
    editListName.value = ''
    editDescription.value = ''
    done()
  }
}
const editClose = () => {
  if (!editLoading.value) {
    editListName.value = ''
    editDescription.value = ''
    showEditWindow.value = false
  }
}
const updateUserList = async () => {
  if (!sheet.value) {
    return
  }
  // console.log('' == null)//false(thanks for using Javascript!)
  const oldDescription = sheet.value.description ? sheet.value.description : ''
  if (editListName.value == sheet.value.name && editDescription.value == oldDescription) {
    ElMessage.warning('未作更改')
    return
  }
  editLoading.value = true
  try {
    const id = sheet.value.id
    const res = await updateUserPlayList({ id, name: editListName.value, desc: editDescription.value })
    // console.log(res.data)
    if (res.data.code == 200) {
      userStore.$state.userMusicList.forEach(item => {
        if (item.id == id) {
          item.name = editListName.value
          item.description = editDescription.value
        }
      })
      ElMessage.success('修改成功')
    } else {
      ElMessage.error(res.data.code + ' 请求失败')
    }
  } catch (err) {
    console.log(err)
  }
  editListName.value = ''
  editDescription.value = ''
  showEditWindow.value = false
  editLoading.value = false
}
</script>

<style lang="scss">
.user-list {
  height: calc(100vh - 160px);

  .banner {
    display: flex;
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

        .option {
          display: flex;
          align-items: center;
          margin-left: 12px;

          .icon-span {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 2px;
            cursor: pointer;
          }
        }
      }

      .create-time {
        color: #606266;
        font-size: 12px;
        margin-top: 6px;
      }

      .ul-loading {
        display: flex;
        flex-direction: column;

        .el-skeleton__item {
          width: 120px;
          margin: 4px 0;
        }
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

  .el-divider {
    margin: 12px 0;
  }
}

.list-edit-dialog {

  .el-dialog__body {
    padding: 6px 24px;

    h3 {
      text-align: center;
    }

    .name,
    .description {
      display: flex;
      align-items: center;
      margin: 12px 0;

      span {
        width: 80px;
        flex-shrink: 0;
      }

      .el-textarea__inner {
        height: auto !important;
        overflow-y: scroll;
      }
    }

    .buttons {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 15px 0;
    }
  }
}
</style>