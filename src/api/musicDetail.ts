import request from '@/util/request'
import { MusicDownloadParams, MusicLyricParams, SongDetailParams } from '@/type/music/detail/MusicDetailRequest'
import { MusicDownloadResponse, MusicLyricResponse, SongDetailResponse } from '@/type/music/detail/MusicDetailResponse'
import { Music } from '@/type/music/Music'
import { Response } from '@/type/music/Response'
import { convertSongToMusic } from '@/util/tools'

export const getSongDetail = (params: SongDetailParams) => {
  return new Promise<Response<Music[]>>(async (resolve, reject) => {
    try {
      const res = await request.get<SongDetailResponse>('/song/detail', { params })
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

export const getMusicDownload = (params: MusicDownloadParams) => {
  return request.get<MusicDownloadResponse>('/song/download/url', { params })
}

export const getMusicLyric = (params: MusicLyricParams) => {
  return request.get<MusicLyricResponse>('/lyric', { params })
}