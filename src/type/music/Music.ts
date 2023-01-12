import { Profile } from "../user/User"

export enum Fee {
  free = 0,
  vip = 1,
  album = 4,
  vipDownload = 8
}

export interface Music {
  id: number
  name: string
  album: string
  aritists: string[]
  cover: string
  url: string
  duration: number
  fee: Fee
  privilege: {
    dlLevel: string
    plLevel: string
  }
}

export interface PlayListCard {
  id: number
  coverImgUrl: string
  name: string
  trackCount: number
  playCount: number
  updateTime: number
  description: string
  tags: string[]
}

export interface StyleTag {
  childrenTags: StyleTag[]
  colorDeep: string
  colorShallow: string
  enName: string
  level: number
  link: string
  picUrl: string
  showText: string
  tagId: number
  tagName: string
}

export interface Song {
  al: {
    id: number
    name: string
    pic: number
    picUrl: string
    pic_str: string
  }
  alia: string[]
  ar: {
    alias: string[]
    id: number
    name: string
  }[]
  privilege?: {
    dlLevel: string
    plLevel: string
  }
  dt: number
  id: number
  name: string
  fee: Fee
}

export interface PersonalizedSong {
  id: number
  name: string
  picUrl: string
  song: {
    id: number
    name: string
    duration: number
    fee: Fee
    album: {
      name: string
    }
    artists: {
      name: string
    }[]
    privilege: {
      dlLevel: string
      plLevel: string
    }
  }
}

export interface UserPlayList {
  id: number
  name: string
  coverImgUrl: string
  trackCount: number
  playCount: number
  createTime: number
  creator: Profile
  userId: number
  description: string | null
  subscribed: boolean//是否为收藏的歌单
}

export type DownloadStatus = 'downloading' | 'success' | 'fail'

export interface DownloadMusic {
  key: string
  name: string
  url: string
  progress: number
  isPaused: boolean
  status: DownloadStatus
  size: number
  receivedSize: number
}

export interface FM {
  id: number
  name: string
  duration: number
  fee: Fee
  album: {
    name: string
    picUrl: string
  }
  artists: {
    name: string
  }[]
  privilege: {
    dlLevel: string
    plLevel: string
  }
}