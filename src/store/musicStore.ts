import { getSongDetail } from "@/api/musicDetail"
import { DownloadMusic, Music } from "@/type/music/Music"

const useMusicStore = defineStore('music', {
  state: () => ({
    musicList: [] as Music[],
    loading: false,
    index: 0,
    initial: true,
    time: '00:00',//当前音乐秒数
    downloadMusicList: [] as DownloadMusic[],
    downloadPath: localStorage.getItem('downloadPath')
  }),
  actions: {
    async initMusicList() {
      this.initial = true//重要
      try {
        const res = await getSongDetail({ ids: '28018269' })
        const result = res.data
        if (result.code == 200) {
          this.musicList = result.data
        }
      } catch (err) {
        console.log(err)
      }
    },
    insert(newMuisc: Music) {
      const indexOf = this.musicList.indexOf(newMuisc)
      // console.log(indexOf, this.musicList)
      if (indexOf != -1) {
        this.index = indexOf
      } else {
        this.musicList.splice(this.index, 0, newMuisc)
      }
    },
    remove(index: number) {
      this.musicList.splice(index, 1)
    }
  },
  getters: {
    music: state => state.musicList[state.index] ? state.musicList[state.index] : null,
    getMusicList: state => state.musicList,
    getDownloadMusicList: state => state.downloadMusicList,
    getDownloadPath: state => state.downloadPath,
    getTime: state => state.time
  }
})

export default useMusicStore