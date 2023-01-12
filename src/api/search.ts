import request from '@/util/request'
import { SearchResultParams } from '@/type/music/search/SearchResultRequest'
import { SearchResultResponse } from '@/type/music/search/SearchResultResponse'
import { Response } from '@/type/music/Response'
import { Music } from '@/type/music/Music'
import { convertSongToMusic } from '@/util/tools'

export const getSearchResult = (params: SearchResultParams) => {
  return new Promise<Response<{ songCount: number, songs: Music[] }>>(async (resolve, reject) => {
    try {
      const res = await request.get<SearchResultResponse>('/cloudsearch', { params })
      const result = res.data
      const data = {
        songCount: result.result.songCount,
        songs: convertSongToMusic(result.result.songs)  
      }
      resolve({ ...res, data: { code: result.code, data } })
    } catch (err) {
      reject(err)
    }
  })
}