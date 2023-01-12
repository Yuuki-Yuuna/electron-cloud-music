import { Song } from "../Music"

export interface SongDetailResponse {
  code: number
  privileges: {
    dlLevel: string 
    plLevel: string
  }[]
  songs: Song[]
}

export interface MusicDownloadResponse {
  code: number
  data: {
    br: number
    code: number
    id: number
    level: string | null
    md5: string | null
    size: number
    type: string | null
    url: string | null
  }
}

type Lyric = {
  lyric: string
  version: number
}

export interface MusicLyricResponse  {
  code: number
  lrc: Lyric
  romalrc: Lyric
  tlyric: Lyric
}