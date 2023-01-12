import request from '@/util/request'
import { StyleSongParams, PersonalizedNewSongParams } from '@/type/music/recommend/MusicRecommendRequest'
import { StyleListResponse, StyleSongResponse, PersonalizedNewSongResponse } from '@/type/music/recommend/MusicRecommendResponse'
import { Music } from '@/type/music/Music'
import { Response } from '@/type/music/Response'
import { convertSongToMusic } from '@/util/tools'

export const getStyleList = () => {
  return request.get<StyleListResponse>('/style/list')
}

export const getStyleSong = (params: StyleSongParams) => {
  return new Promise<Response<Music[]>>(async (resolve, reject) => {
    try {
      const res = await request.get<StyleSongResponse>('/style/song', { params })
      const result = res.data
      let data: Music[] = []
      if (result.code == 200) {
        data = convertSongToMusic(result.data.songs)
      }
      resolve({ ...res, data: { code: result.code, data } })
    } catch (err) {
      reject(err)
    }
  })
}

export const getPersonalizedNewSong = (params: PersonalizedNewSongParams) => {
  return new Promise<Response<Music[]>>(async (resolve, reject) => {
    try {
      const res = await request.get<PersonalizedNewSongResponse>('/personalized/newsong', { params })
      const result = res.data
      let data: Music[] = []
      if (result.code == 200) {
        //这个接口的song不太一样
        data = result.result.map(item => ({
          id: item.id,
          name: item.name,
          album: item.song.album.name,
          aritists: item.song.artists.map(artist => artist.name),
          cover: item.picUrl,
          url: `https://music.163.com/song/media/outer/url?id=${item.id}.mp3`,
          duration: item.song.duration,
          fee: item.song.fee,
          privilege: {
            dlLevel: item.song.privilege.dlLevel,
            plLevel: item.song.privilege.plLevel
          }
        }))
      }
      resolve({ ...res, data: { code: result.code, data } })
    } catch (err) {
      reject(err)
    }
  })
}