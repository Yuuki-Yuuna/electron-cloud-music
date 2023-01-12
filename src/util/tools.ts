import { Music, Song } from "@/type/music/Music"

export const musicdt = (songdt: number) => {
  let min: number | string = Math.floor(songdt / 1000 / 60)
  let sec: number | string = Math.floor(songdt / 1000 % 60+0.5)
  // console.log(min, sec)
  if (min < 10) {
    min = '0' + min
  }
  if (sec < 10) {
    sec = '0' + sec
  }
  return min + ":" + sec
}

export const convertSongToMusic = (songs: Song[]) => {
  const music: Music[] = songs.map(song => ({
    id: song.id,
    name: song.name,
    album: song.alia[0],
    aritists: song.ar.map(item => item.name),
    cover: song.al.picUrl,
    url: `https://music.163.com/song/media/outer/url?id=${song.id}.mp3`,
    duration: song.dt,
    fee: song.fee,
    privilege: {
      dlLevel: song.privilege? song.privilege.dlLevel : '',
      plLevel: song.privilege? song.privilege.plLevel : ''
    }
  }))
  return music
}