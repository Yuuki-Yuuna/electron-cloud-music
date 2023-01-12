import request from '@/util/request'
import { HighqualityPlayListParams, PlayListAllParams, PlayListDetailParams,  TopPLayListParams } from '@/type/music/playlist/MusicPlayListRequest'
import { HighqualityPlayListResponse, PlayListAllResponse, PlayListDetailResponse } from '@/type/music/playlist/MusicPlayListResponse'
import { Response } from '@/type/music/Response'
import { Music } from '@/type/music/Music'
import { convertSongToMusic } from '@/util/tools'

export const getPlayListCatList = () => {
  return request.get('/playlist/catlist')
}

export const getTopPlayList = (params?: TopPLayListParams) => {
  return request.get('/top/playlist', { params })
}

export const getHighqualityPlayListTag = () => {
  return request.get('/playlist/highquality/tags')
}

export const getHighqualityPlayList = (params?: HighqualityPlayListParams) => {
  return request.get<HighqualityPlayListResponse>('/top/playlist/highquality', { params })
}

export const getPlayListDetail = (params: PlayListDetailParams) => {
  return request.get<PlayListDetailResponse>('/playlist/detail', { params })
}

export const getPlayListAll = (params: PlayListAllParams) => {
  return new Promise<Response<Music[]>>(async (resolve, reject) => {
    try {
      const res = await request.get<PlayListAllResponse>('/playlist/track/all', { params })
      const result = res.data
      let data: Music[] = []
      if (result.code == 200) {
        data = convertSongToMusic(result.songs)
        data.forEach((item, index) => {
          item.privilege = {
            dlLevel: result.privileges[index].dlLevel,
            plLevel: result.privileges[index].plLevel
          }
        })
      }
      resolve({ ...res, data: { code: result.code, data } })
    } catch (err) {
      reject(err)
    }
  })
}