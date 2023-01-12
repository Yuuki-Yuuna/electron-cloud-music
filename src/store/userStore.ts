import { UserPlayList } from "@/type/music/Music"
import { Profile } from "@/type/user/User"

const useUserStore = defineStore('user', {
  state: () => ({
    profile: null as Profile | null,
    loginStatus: false,
    showLoginWindow: false,
    showListCreateWindow: false,//创建歌单对话框
    userLikeList: [] as number[],//喜欢音乐id
    userMusicList: [] as UserPlayList[]
  }),
  actions: {

  },
  getters: {
    getLoginStatus: state => state.loginStatus,
    getProfile: state => state.profile,
    getUserMusicList: state => state.userMusicList,
    getUserLikeList: state => state.userLikeList
  }
})

export default useUserStore