import { FM, Song, UserPlayList } from "../Music"

export interface LikeListResponse {
  code: number
  checkPoint: number
  ids: number[]
}

export interface LikeMusicResponse {
  code: number
  playlistId: number
}

export interface RecentSongResponse {
  code: number
  data: {
    list: {
      banned: boolean
      data: Song
      playTime: number
      resourceId: string
      resourceType: string
    }[]
    total: number
  }
}

export interface UserPlayListResponse {
  code: number
  more: boolean
  playlist: UserPlayList[]
}

export interface SubscribePlaylistResponse {
  code: number
}

export interface OperateUserPlayListResponse {
  status: number
  body: {
    code: number
    cloudCount?: number
    count?: number
    trackIds?: string
    message?: string
  }
}

export interface NewUserPlayListResponse {
  code: number
  id: number
  playlist: UserPlayList
}

export interface DeleteUserPlayListResponse {
  code: number
  data: any
  message: string | null
  msg: string | null
}

export interface UpdateUserPlayListResponse {
  code: number
  //其他参数有'/'，应该是分成三个请求发了
}

export interface UserFMResponse {
  code: number
  data: FM[]
}