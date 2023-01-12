import { PlayListCard, Song } from "../Music"

export interface HighqualityPlayListResponse {
  code: number
  lasttime: number
  more: boolean
  playlists: PlayListCard[]
}

export interface PlayListDetailResponse {
  code: number
  playlist: PlayListCard
}

export interface PlayListAllResponse {
  code: number
  privileges: {
    dlLevel: string
    plLevel: string
  }[]
  songs: Song[]
}